using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Product repository interface with product-specific queries
/// </summary>
public interface IProductRepository
{
    // Basic CRUD
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product> AddAsync(Product entity);
    Task<IEnumerable<Product>> AddRangeAsync(IEnumerable<Product> entities);
    Task UpdateAsync(Product entity);
    Task DeleteAsync(Product entity);
    Task DeleteRangeAsync(IEnumerable<Product> entities);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Product-specific queries
    /// <summary>
    /// Get product by ID with details (shop, store)
    /// </summary>
    Task<Product?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get all active (non-deleted) products with pagination
    /// </summary>
    Task<IEnumerable<Product>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get products by shop ID
    /// </summary>
    Task<IEnumerable<Product>> GetProductsByShopIdAsync(int shopId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get products by store ID
    /// </summary>
    Task<IEnumerable<Product>> GetProductsByStoreIdAsync(int storeId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get available products (in stock)
    /// </summary>
    Task<IEnumerable<Product>> GetAvailableProductsAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Search products by name or description
    /// </summary>
    Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get products by price range
    /// </summary>
    Task<IEnumerable<Product>> GetProductsByPriceRangeAsync(decimal minPrice, decimal maxPrice, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get active products count
    /// </summary>
    Task<int> GetActiveCountAsync();

    /// <summary>
    /// Check if product belongs to organization's shop/store
    /// </summary>
    Task<bool> IsProductOwnedByOrganizationAsync(int productId, int orgId);
}

