using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Review-specific repository implementation
/// </summary>
public class ReviewRepository : IReviewRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Review> _dbSet;

    public ReviewRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Review>();
    }

    #region Basic CRUD

    public async Task<Review?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Review>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Review> AddAsync(Review entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Review entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Review entity)
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

    #region Review-specific queries

    public async Task<Review?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r._event)
            .Include(r => r.product)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Review>> GetReviewsByEventIdAsync(int eventId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r._event)
            .Include(r => r.product)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<float> GetAverageRatingForEventAsync(int eventId)
    {
        var reviews = await _dbSet
            .Where(r => r.EventId == eventId && !r.IsDeleted)
            .ToListAsync();
        
        return reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
    }

    public async Task<float> GetAverageRatingForProductAsync(int productId)
    {
        var reviews = await _dbSet
            .Where(r => r.ProductId == productId && !r.IsDeleted)
            .ToListAsync();
        
        return reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
    }

    public async Task<IEnumerable<Review>> GetActiveReviewsByEventIdAsync(int eventId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Where(r => r.EventId == eventId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetActiveReviewsByProductIdAsync(int productId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Where(r => r.ProductId == productId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> HasUserReviewedEventAsync(string userId, int eventId)
    {
        return await _dbSet.AnyAsync(r => r.UserId == userId && r.EventId == eventId && !r.IsDeleted);
    }

    public async Task<bool> HasUserReviewedProductAsync(string userId, int productId)
    {
        return await _dbSet.AnyAsync(r => r.UserId == userId && r.ProductId == productId && !r.IsDeleted);
    }

    public async Task<int> GetReviewsCountForEventAsync(int eventId)
    {
        return await _dbSet.CountAsync(r => r.EventId == eventId && !r.IsDeleted);
    }

    public async Task<int> GetReviewsCountForProductAsync(int productId)
    {
        return await _dbSet.CountAsync(r => r.ProductId == productId && !r.IsDeleted);
    }

    #endregion
    
    public async Task<Review> CreateReviewAsync(Review review)
    {
        var entry = await _dbSet.AddAsync(review);
        return entry.Entity;
    }

    public async Task<Review?> GetReviewByIdAsync(int id)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r._event)
            .Include(r => r.product)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }

    public async Task<IEnumerable<Review>> GetAllReviewsAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(r => r.user)
            .Include(r => r._event)
            .Include(r => r.product)
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Review?> UpdateReviewAsync(Review review)
    {
        var existing = await _dbSet.FindAsync(review.Id);
        if (existing == null || existing.IsDeleted)
            return null;
    
        _dbSet.Update(review);
        return review;
    }

    public async Task<bool> DeleteReviewAsync(int id)
    {
        var review = await _dbSet.FindAsync(id);
        if (review == null || review.IsDeleted)
            return false;
    
        review.MarkAsDeleted();
        _dbSet.Update(review);
        return true;
    }
}

