using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly DbSet<Payment> _dbSet;

    public PaymentRepository(DBContext context)
    {
        _dbSet = context.Set<Payment>();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(p => p.order)
            .ThenInclude(o => o.items)
            .Include(p => p.order)
            .ThenInclude(o => o.user)
            .FirstOrDefaultAsync(p => p.id == id);
    }
    public async Task<IEnumerable<Payment>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public async Task<Payment> AddAsync(Payment entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Payment entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Payment entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _dbSet.AnyAsync(p => p.id == id);

    public async Task<int> CountAsync()
        => await _dbSet.CountAsync();

    public async Task<Payment?> GetByOrderIdAsync(int orderId)
        => await _dbSet
            .Include(p => p.order)
            .FirstOrDefaultAsync(p => p.order_id == orderId);

    public async Task<IEnumerable<Payment>> GetPaymentsByStatusAsync(string status)
        => await _dbSet
            .Where(p => p.status == status)
            .OrderByDescending(p => p.payment_date)
            .ToListAsync();
}