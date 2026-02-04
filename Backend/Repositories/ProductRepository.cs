using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Product-specific repository implementation
/// </summary>
public class ProductRepository : IProductRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Product> _dbSet;

    public ProductRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Product>();
    }

    #region Basic CRUD

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        return await _dbSet.Include(e => e.store)
            .ThenInclude(o => o.org)
            .Include(s => s.shop)
            .ThenInclude(e => e._event)
            .ThenInclude(o => o.org).ToListAsync();
    }

    public async Task<Product> AddAsync(Product entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public async Task<IEnumerable<Product>> AddRangeAsync(IEnumerable<Product> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        return entities;
    }

    public Task UpdateAsync(Product entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Product entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public Task DeleteRangeAsync(IEnumerable<Product> entities)
    {
        _dbSet.RemoveRange(entities);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(p => p.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Product-specific queries

    public async Task<Product?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.shop)
                .ThenInclude(s => s!._event)
            .Include(p => p.store)
                .ThenInclude(s => s!.org)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<IEnumerable<Product>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(p => p.shop)
            .Include(p => p.store)
            .Where(p => !p.IsDeleted)
            .OrderByDescending(p => p.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetProductsByShopIdAsync(int shopId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Where(p => p.ShopId == shopId && !p.IsDeleted)
            .OrderBy(p => p.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetProductsByStoreIdAsync(int storeId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Where(p => p.StoreId == storeId && !p.IsDeleted)
            .OrderBy(p => p.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetAvailableProductsAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(p => p.shop)
            .Include(p => p.store)
            .Where(p => !p.IsDeleted && (p.StockQuantity - p.QuantitySold) > 0)
            .OrderByDescending(p => p.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm, int pageNumber = 1, int pageSize = 20)
    {
        var searchLower = searchTerm.ToLower();
        return await _dbSet
            .Include(p => p.shop)
            .Include(p => p.store)
            .Where(p => !p.IsDeleted &&
                       (p.Name.ToLower().Contains(searchLower) ||
                        (p.Description != null && p.Description.ToLower().Contains(searchLower))))
            .OrderBy(p => p.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetProductsByPriceRangeAsync(decimal minPrice, decimal maxPrice, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(p => p.shop)
            .Include(p => p.store)
            .Where(p => !p.IsDeleted && p.Price >= minPrice && p.Price <= maxPrice)
            .OrderBy(p => p.Price)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _dbSet.CountAsync(p => !p.IsDeleted);
    }

    public async Task<bool> IsProductOwnedByOrganizationAsync(int productId, int orgId)
    {
        return await _dbSet
            .Include(p => p.shop)
                .ThenInclude(s => s!._event)
            .Include(p => p.store)
            .AnyAsync(p => p.Id == productId && !p.IsDeleted &&
                          ((p.shop != null && p.shop._event != null && p.shop._event.OrgId == orgId) ||
                           (p.store != null && p.store.OrgId == orgId)));
    }
    
    #endregion
}

