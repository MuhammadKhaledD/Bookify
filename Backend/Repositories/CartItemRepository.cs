using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

public class CartItemRepository : ICartItemRepository
{
    private readonly DbSet<CartItem> _dbSet;

    public CartItemRepository(DBContext context)
    {
        _dbSet = context.Set<CartItem>();
    }

    public async Task<CartItem?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<CartItem>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public async Task<CartItem> AddAsync(CartItem entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public async Task<IEnumerable<CartItem>> AddRangeAsync(IEnumerable<CartItem> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        return entities;
    }

    public Task UpdateAsync(CartItem entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(CartItem entity)
    {
        entity.mark_as_deleted();
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteRangeAsync(IEnumerable<CartItem> entities)
    {
        foreach (var item in entities)
            item.mark_as_deleted();

        _dbSet.UpdateRange(entities);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _dbSet.AnyAsync(ci => ci.id == id);

    public async Task<int> CountAsync()
        => await _dbSet.CountAsync();

    public async Task<IEnumerable<CartItem>> GetItemsByCartIdAsync(int cartId)
        => await _dbSet
            .Where(ci => ci.cart_id == cartId)
            .ToListAsync();

    public async Task<CartItem?> GetByCartAndItemAsync(int cartId, int itemId, string itemType)
        => await _dbSet.FirstOrDefaultAsync(ci =>
            ci.cart_id == cartId &&
            ci.item_id == itemId &&
            ci.item_type == itemType);

    public async Task<int> GetCartItemCountAsync(int cartId)
        => await _dbSet.CountAsync(ci => ci.cart_id == cartId);
    


}
