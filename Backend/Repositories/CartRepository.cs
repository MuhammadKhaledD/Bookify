using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

public class CartRepository : ICartRepository
{
    private readonly DbSet<Cart> _dbSet;

    public CartRepository(DBContext context)
    {
        _dbSet = context.Set<Cart>();
    }

    public async Task<Cart?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<Cart>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public async Task<Cart> AddAsync(Cart entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Cart entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Cart entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _dbSet.AnyAsync(c => c.id == id);

    public async Task<int> CountAsync()
        => await _dbSet.CountAsync();

    public async Task<Cart?> GetCartByUserIdAsync(string userId)
        => await _dbSet
            .Include(c => c.cart_items)
            .FirstOrDefaultAsync(c => c.user_id == userId);

    public async Task<bool> UserHasCartAsync(string userId)
        => await _dbSet.AnyAsync(c => c.user_id == userId);
}