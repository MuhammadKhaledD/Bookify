using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

public interface IPaymentRepository
{
    // Basic CRUD
    Task<Payment?> GetByIdAsync(int id);
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment> AddAsync(Payment entity);
    Task UpdateAsync(Payment entity);
    Task DeleteAsync(Payment entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Payment queries
    Task<Payment?> GetByOrderIdAsync(int orderId);
    Task<IEnumerable<Payment>> GetPaymentsByStatusAsync(string status);
}