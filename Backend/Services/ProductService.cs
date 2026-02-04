﻿using Bookify_Backend.Entities;
using Bookify_Backend.Helpers;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class ProductService
{
    private readonly IShopRepository _shopRepo;
    private readonly IProductRepository _productRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AzureBlobHelper _blobHelper;

    public ProductService(IShopRepository shopRepo, IProductRepository productRepo, IUnitOfWork unitOfWork,AzureBlobHelper blobHelper)
    {
        _shopRepo = shopRepo;
        _productRepo = productRepo;
        _unitOfWork = unitOfWork;
        this._blobHelper = blobHelper;
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    public async Task<Product?> CreateProductAsync(string name, int stockQuantity, int? shopId = null, 
        int? storeId = null, string? description = null, decimal? price = null, 
        int limitPerUser = 1, decimal discount = 0, int pointsEarnedPerUnit = 0, IFormFile? productImage = null)
    {
        // Validate that either shopId or storeId is provided
        if (!shopId.HasValue && !storeId.HasValue)
        {
            return null; // Must provide either shopId or storeId
        }

        // If shopId is provided, verify shop exists
        if (shopId.HasValue && !await _shopRepo.ExistsAsync(shopId.Value))
        {
            return null; // Shop doesn't exist
        }

        // If storeId is provided, verify store exists
        if (storeId.HasValue && !await _unitOfWork.Stores.ExistsAsync(storeId.Value))
        {
            return null; // Store doesn't exist
        }
        string producturl;
        if (productImage != null && productImage.Length > 0)
        {
            producturl = await _blobHelper.UploadImageAsync(productImage);
        }
        else
        {
            producturl = "https://ebraebra.blob.core.windows.net/profile/default.png";
        }

        var product = new Product(name, stockQuantity, shopId, storeId, description, 
            price, limitPerUser, discount, pointsEarnedPerUnit, producturl);

        await _productRepo.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return product;
    }

    /// <summary>
    /// Get product by ID with details
    /// </summary>
    public async Task<Product?> GetProductByIdAsync(int id)
    {
        var product = await _productRepo.GetByIdWithDetailsAsync(id);
        
        if (product == null || product.IsDeleted)
        {
            return null;
        }

        return product;
    }

    /// <summary>
    /// Update an existing product
    /// </summary>
    public async Task<bool> UpdateProductAsync(int id, string? name = null, string? description = null, 
        decimal? price = null, int? stockQuantity = null, int? limitPerUser = null, 
        decimal? discount = null, int? pointsEarnedPerUnit = null, IFormFile? productImage = null)
    {
        // Check if product exists
        if (!await _productRepo.ExistsAsync(id))
        {
            return false;
        }

        var product = await _productRepo.GetByIdAsync(id);

        if (product == null || product.IsDeleted)
        {
            return false;
        }
        string producturl;
        if (productImage != null && productImage.Length > 0)
        {
            producturl = await _blobHelper.UploadImageAsync(productImage);
        }
        else
        {
            producturl =null;
        }

        // Use the Product's Update method
        product.Update(name, description, price, stockQuantity, limitPerUser, discount, pointsEarnedPerUnit, producturl);

        await _productRepo.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Delete a product (soft delete)
    /// </summary>
    public async Task<bool> DeleteProductAsync(int id)
    {
        // Check if product exists
        if (!await _productRepo.ExistsAsync(id))
        {
            return false;
        }

        var product = await _productRepo.GetByIdAsync(id);

        if (product == null || product.IsDeleted)
        {
            return false;
        }

        product.MarkAsDeleted();

        await _productRepo.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();


        return true;
    }

    public async Task<object?> GetAllProductsAsync()
    {
        var products = await _productRepo.GetAllAsync();

        return products.Where(p => p.IsDeleted == false).Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.LimitPerUser,
                p.Discount,
                p.PointsEarnedPerUnit,
                p.ProductImage,
                p.ShopId,
                p.StoreId,
            orgName = p.shop != null ? p.shop._event.org.Name : p.store != null ? p.store.org.Name : null
            }
        );
    }
}
