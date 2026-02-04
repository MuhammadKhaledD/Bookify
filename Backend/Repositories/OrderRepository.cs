using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly DbSet<Order> _dbSet;

    public OrderRepository(DBContext context)
    {
        _dbSet = context.Set<Order>();
    }

    public async Task<Order?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<Order>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public async Task<Order> AddAsync(Order entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public async Task<IEnumerable<Order>> AddRangeAsync(IEnumerable<Order> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        return entities;
    }

    public Task UpdateAsync(Order entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Order entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _dbSet.AnyAsync(o => o.id == id);

    public async Task<int> CountAsync()
        => await _dbSet.CountAsync();

    public async Task<Order?> GetByIdWithDetailsAsync(int id)
        => await _dbSet
            .Include(o => o.items)
            .Include(o => o.payment)
            .FirstOrDefaultAsync(o => o.id == id);

    public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
        => await _dbSet
            .Where(o => o.user_id == userId)
            .OrderByDescending(o => o.order_date)
            .ToListAsync();

    public async Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status)
        => await _dbSet
            .Where(o => o.status == status)
            .OrderByDescending(o => o.order_date)
            .ToListAsync();
}