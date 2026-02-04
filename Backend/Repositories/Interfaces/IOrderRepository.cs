using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

public interface IOrderRepository
{
    // Basic CRUD
    Task<Order?> GetByIdAsync(int id);
    Task<IEnumerable<Order>> GetAllAsync();
    Task<Order> AddAsync(Order entity);
    Task<IEnumerable<Order>> AddRangeAsync(IEnumerable<Order> entities);
    Task UpdateAsync(Order entity);
    Task DeleteAsync(Order entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Order queries
    Task<Order?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId);
    Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status);
}