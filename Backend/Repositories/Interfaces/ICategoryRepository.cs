using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Category repository interface with category-specific queries
/// </summary>
public interface ICategoryRepository
{
    // Basic CRUD
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category> AddAsync(Category entity);
    Task UpdateAsync(Category entity);
    Task DeleteAsync(Category entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Category-specific queries
    /// <summary>
    /// Get all active (non-deleted) categories
    /// </summary>
    Task<IEnumerable<Category>> GetAllActiveAsync();

    /// <summary>
    /// Get category by name
    /// </summary>
    Task<Category?> GetByNameAsync(string name);

    /// <summary>
    /// Get category with its events
    /// </summary>
    Task<Category?> GetByIdWithEventsAsync(int id);

    /// <summary>
    /// Check if category name already exists
    /// </summary>
    Task<bool> NameExistsAsync(string name);

    /// <summary>
    /// Get categories with event count
    /// </summary>
    Task<IEnumerable<Category>> GetCategoriesWithEventCountAsync();
}

