using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

public interface ICartItemRepository
{
    // Basic CRUD
    Task<CartItem?> GetByIdAsync(int id);
    Task<IEnumerable<CartItem>> GetAllAsync();
    Task<CartItem> AddAsync(CartItem entity);
    Task<IEnumerable<CartItem>> AddRangeAsync(IEnumerable<CartItem> entities);
    Task UpdateAsync(CartItem entity);
    Task DeleteAsync(CartItem entity);
    Task DeleteRangeAsync(IEnumerable<CartItem> entities);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Cart queries
    Task<IEnumerable<CartItem>> GetItemsByCartIdAsync(int cartId);
    Task<CartItem?> GetByCartAndItemAsync(int cartId, int itemId, string itemType);
    Task<int> GetCartItemCountAsync(int cartId);
}