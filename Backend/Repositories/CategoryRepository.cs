using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Category-specific repository implementation
/// </summary>
public class CategoryRepository : ICategoryRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Category> _dbSet;

    public CategoryRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Category>();
    }

    #region Basic CRUD

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Category> AddAsync(Category entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Category entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Category entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(c => c.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Category-specific queries

    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower() && !c.IsDeleted);
    }

    public async Task<Category?> GetByIdWithEventsAsync(int id)
    {
        return await _dbSet
            .Include(c => c.events.Where(e => !e.IsDeleted))
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await _dbSet.AnyAsync(c => c.Name.ToLower() == name.ToLower() && !c.IsDeleted);
    }

    public async Task<IEnumerable<Category>> GetCategoriesWithEventCountAsync()
    {
        return await _dbSet
            .Include(c => c.events.Where(e => !e.IsDeleted))
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    #endregion
}

