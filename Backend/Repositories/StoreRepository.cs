using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Store-specific repository implementation
/// </summary>
public class StoreRepository : IStoreRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Store> _dbSet;

    public StoreRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Store>();
    }

    #region Basic CRUD

    public async Task<Store?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Store>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Store> AddAsync(Store entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Store entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Store entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(s => s.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Store-specific queries

    public async Task<Store?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(s => s.org)
            .Include(s => s.products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Store?> GetStoreByOrganizationIdAsync(int orgId)
    {
        return await _dbSet
            .Include(s => s.products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(s => s.OrgId == orgId);
    }

    public async Task<IEnumerable<Store>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(s => s.org)
            .Where(s => s.Status)
            .OrderBy(s => s.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Store?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.Name != null && s.Name.ToLower() == name.ToLower() && s.Status);
    }

    public async Task<bool> OrganizationHasStoreAsync(int orgId)
    {
        return await _dbSet.AnyAsync(s => s.OrgId == orgId);
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _dbSet.CountAsync(s => s.Status);
    }

    #endregion
}

