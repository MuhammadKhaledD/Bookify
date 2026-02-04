using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// OrganizationOrganizer-specific repository implementation
/// </summary>
public class OrganizationOrganizerRepository : IOrganizationOrganizerRepository
{
    private readonly DBContext _context;
    private readonly DbSet<OrganizationOrganizer> _dbSet;

    public OrganizationOrganizerRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<OrganizationOrganizer>();
    }

    #region Basic CRUD

    public async Task<OrganizationOrganizer?> GetByIdAsync(string userId, int orgId)
    {
        return await _dbSet.FindAsync(userId, orgId);
    }

    public async Task<IEnumerable<OrganizationOrganizer>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<OrganizationOrganizer> AddAsync(OrganizationOrganizer entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(OrganizationOrganizer entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(OrganizationOrganizer entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string userId, int orgId)
    {
        return await _dbSet.AnyAsync(oo => oo.UserId == userId && oo.OrgId == orgId);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region OrganizationOrganizer-specific queries

    public async Task<IEnumerable<OrganizationOrganizer>> GetOrganizersByOrganizationAsync(int orgId)
    {
        return await _dbSet
            .Include(oo => oo.user)
            .Where(oo => oo.OrgId == orgId)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrganizationOrganizer>> GetOrganizationsByUserAsync(string userId)
    {
        return await _dbSet
            .Include(oo => oo.org)
            .Where(oo => oo.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrganizationOrganizer>> GetActiveOrganizersByOrganizationAsync(int orgId)
    {
        return await _dbSet
            .Include(oo => oo.user)
            .Where(oo => oo.OrgId == orgId && !oo.IsDeleted)
            .ToListAsync();
    }

    public async Task<bool> IsUserOrganizerOfOrganizationAsync(string userId, int orgId)
    {
        return await _dbSet.AnyAsync(oo => oo.UserId == userId && oo.OrgId == orgId && !oo.IsDeleted);
    }

    public async Task<IEnumerable<int>> GetOrganizationIdsForUserAsync(string userId)
    {
        return await _dbSet
            .Where(oo => oo.UserId == userId && !oo.IsDeleted)
            .Select(oo => oo.OrgId)
            .ToListAsync();
    }

    public async Task<IEnumerable<OrganizationOrganizer>> GetByUserIdAsync(string userId)
    {
        
        return await _context.OrganizationOrganizers
            .Where(oo => oo.UserId == userId && !oo.IsDeleted)
            .ToListAsync();
        
    }

    #endregion
}

