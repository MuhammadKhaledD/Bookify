﻿﻿using Bookify_Backend.DTOs;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/events")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductsController(ProductService productService)
    {
        _productService = productService;
    }
    
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _productService.GetAllProductsAsync();
        
        return Ok(products);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductRequest request)
    {
        var product = await _productService.CreateProductAsync(
            request.Name,
            request.StockQuantity,
            request.ShopId,
            request.StoreId,
            request.Description,
            request.Price,
            request.LimitPerUser,
            request.Discount,
            request.PointsEarnedPerUnit,
            request.ProductImage
        );

        if (product == null)
        {
            return BadRequest(new { message = "Failed to create product. Ensure shopId or storeId is provided and exists." });
        }

        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProductById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(product);
    }

    /// <summary>
    /// Update an existing product
    /// </summary>
    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductRequest request)
    {
        var result = await _productService.UpdateProductAsync(
            id,
            request.Name,
            request.Description,
            request.Price,
            request.StockQuantity,
            request.LimitPerUser,
            request.Discount,
            request.PointsEarnedPerUnit,
            request.ProductImage
        );

        if (!result)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(new { message = "Product updated successfully" });
    }

    /// <summary>
    /// Delete a product (soft delete)
    /// </summary>
    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _productService.DeleteProductAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(new { message = "Product deleted successfully" });
    }
}

