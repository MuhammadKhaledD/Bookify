using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Shop-specific repository implementation
/// </summary>
public class ShopRepository : IShopRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Shop> _dbSet;

    public ShopRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Shop>();
    }

    #region Basic CRUD

    public async Task<Shop?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Shop>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Shop> AddAsync(Shop entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Shop entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Shop entity)
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

    #region Shop-specific queries

    public async Task<Shop?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(s => s._event)
                .ThenInclude(e => e!.org)
            .Include(s => s.products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Shop?> GetShopByEventIdAsync(int eventId)
    {
        return await _dbSet
            .Include(s => s.products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(s => s.EventId == eventId);
    }

    public async Task<IEnumerable<Shop>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(s => s._event)
            .Where(s => s.Status)
            .OrderBy(s => s.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Shop?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.Name.ToLower() == name.ToLower() && s.Status);
    }

    public async Task<bool> EventHasShopAsync(int eventId)
    {
        return await _dbSet.AnyAsync(s => s.EventId == eventId);
    }

    public async Task<IEnumerable<Shop>> GetShopsByOrganizationAsync(int orgId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(s => s._event)
            .Where(s => s._event != null && s._event.OrgId == orgId && s.Status)
            .OrderBy(s => s.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    #endregion
}

