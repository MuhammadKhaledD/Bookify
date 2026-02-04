using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Organization-specific repository implementation
/// </summary>
public class OrganizationRepository : IOrganizationRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Organization> _dbSet;

    public OrganizationRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Organization>();
    }

    #region Basic CRUD

    public async Task<Organization?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Organization>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Organization> AddAsync(Organization entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Organization entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Organization entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(o => o.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Organization-specific queries

    public async Task<IEnumerable<Organization>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Where(o => !o.IsDeleted)
            .OrderBy(o => o.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Organization?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(o => o.events.Where(e => !e.IsDeleted))
            .Include(o => o.store)
            .Include(o => o.organization_organizers.Where(oo => !oo.IsDeleted))
                .ThenInclude(oo => oo.user)
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
    }

    public async Task<Organization?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(o => o.Name.ToLower() == name.ToLower() && !o.IsDeleted);
    }

    public async Task<IEnumerable<Organization>> GetOrganizationsByOrganizerAsync(string userId)
    {
        return await _dbSet
            .Include(o => o.organization_organizers)
            .Where(o => !o.IsDeleted && o.organization_organizers.Any(oo => oo.UserId == userId && !oo.IsDeleted))
            .ToListAsync();
    }

    public async Task<IEnumerable<int>> GetOrganizationIdsByOrganizerAsync(string userId)
    {
        return await _context.Set<OrganizationOrganizer>()
            .Where(oo => oo.UserId == userId && !oo.IsDeleted)
            .Select(oo => oo.OrgId)
            .ToListAsync();
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await _dbSet.AnyAsync(o => o.Name.ToLower() == name.ToLower() && !o.IsDeleted);
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _dbSet.CountAsync(o => !o.IsDeleted);
    }

    #endregion
}

