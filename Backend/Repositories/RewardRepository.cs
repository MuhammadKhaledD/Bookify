using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Reward-specific repository implementation
/// </summary>
public class RewardRepository : IRewardRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Reward> _dbSet;

    public RewardRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Reward>();
    }

    #region Basic CRUD

    public async Task<Reward?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Reward>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Reward> AddAsync(Reward entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Reward entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Reward entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(r => r.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Reward-specific queries

    public async Task<Reward?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
                .ThenInclude(t => t!._event)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }

    public async Task<IEnumerable<Reward>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
            .Where(r => !r.IsDeleted && r.Status)
            .OrderBy(r => r.PointsRequired)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reward>> GetRewardsByTypeAsync(string rewardType, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
            .Where(r => !r.IsDeleted && r.Status && r.RewardType == rewardType)
            .OrderBy(r => r.PointsRequired)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reward>> GetRewardsByPointsRangeAsync(int minPoints, int maxPoints, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
            .Where(r => !r.IsDeleted && r.Status && r.PointsRequired >= minPoints && r.PointsRequired <= maxPoints)
            .OrderBy(r => r.PointsRequired)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reward>> GetNonExpiredRewardsAsync(int pageNumber = 1, int pageSize = 20)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
            .Where(r => !r.IsDeleted && r.Status && (r.ExpireDate == null || r.ExpireDate > now))
            .OrderBy(r => r.PointsRequired)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reward>> GetRewardsByProductIdAsync(int productId)
    {
        return await _dbSet
            .Where(r => r.ItemProductId == productId && !r.IsDeleted)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reward>> GetRewardsByTicketIdAsync(int ticketId)
    {
        return await _dbSet
            .Where(r => r.ItemTicketId == ticketId && !r.IsDeleted)
            .ToListAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _dbSet.CountAsync(r => !r.IsDeleted && r.Status);
    }

    public async Task<IEnumerable<Reward>> GetRewardsRedeemableWithPointsAsync(int points, int pageNumber = 1, int pageSize = 20)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(r => r.item_product)
            .Include(r => r.item_ticket)
            .Where(r => !r.IsDeleted && r.Status && 
                       r.PointsRequired <= points &&
                       (r.ExpireDate == null || r.ExpireDate > now))
            .OrderByDescending(r => r.PointsRequired)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    #endregion
}

