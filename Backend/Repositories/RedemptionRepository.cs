using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Redemption-specific repository implementation
/// </summary>
public class RedemptionRepository : IRedemptionRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Redemption> _dbSet;

    public RedemptionRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Redemption>();
    }

    #region Basic CRUD

    public async Task<Redemption?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Redemption>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Redemption> AddAsync(Redemption entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Redemption entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Redemption entity)
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

    public async Task<IEnumerable<Redemption>> GetRedemptionsByProductIdAsync(int productId)
    {
        return await _dbSet
            .Include(r => r.reward)
            .Where(r => r.reward.ItemProductId == productId)
            .OrderByDescending(r => r.RedeemedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Redemption>> GetRedemptionsByTicketIdAsync(int ticketId)
    {
        return await _dbSet
            .Include(r => r.reward)
            .Where(r => r.reward.ItemTicketId == ticketId)
            .OrderByDescending(r => r.RedeemedAt)
            .ToListAsync();
    }

    #endregion

    #region Redemption-specific queries

    public async Task<Redemption?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r.reward)
                .ThenInclude(rw => rw.item_product)
            .Include(r => r.reward)
                .ThenInclude(rw => rw.item_ticket)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Redemption>> GetRedemptionsByUserIdAsync(string userId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.reward)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.RedeemedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Redemption>> GetRedemptionsByRewardIdAsync(int rewardId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Where(r => r.RewardId == rewardId)
            .OrderByDescending(r => r.RedeemedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Redemption>> GetRedemptionsByStatusAsync(string status, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r.reward)
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.RedeemedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalPointsRedeemedByUserAsync(string userId)
    {
        return await _dbSet
            .Where(r => r.UserId == userId)
            .SumAsync(r => r.PointsSpent);
    }

    public async Task<int> GetRedemptionsCountByUserAsync(string userId)
    {
        return await _dbSet.CountAsync(r => r.UserId == userId);
    }

    public async Task<IEnumerable<Redemption>> GetRedemptionsByDateRangeAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r.reward)
            .Where(r => r.RedeemedAt >= startDate && r.RedeemedAt <= endDate)
            .OrderByDescending(r => r.RedeemedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    #endregion
    
    
}

