using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

public interface ICartRepository
{
    // Basic CRUD
    Task<Cart?> GetByIdAsync(int id);
    Task<IEnumerable<Cart>> GetAllAsync();
    Task<Cart> AddAsync(Cart entity);
    Task UpdateAsync(Cart entity);
    Task DeleteAsync(Cart entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Cart queries
    Task<Cart?> GetCartByUserIdAsync(string userId);
    Task<bool> UserHasCartAsync(string userId);
}