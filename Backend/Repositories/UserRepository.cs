﻿using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// User-specific repository with custom queries
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly DBContext _context;
    private readonly DbSet<User> _dbSet;

    public UserRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<User>();
    }

    #region Basic CRUD

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<User> AddAsync(User entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(User entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(User entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _dbSet.AnyAsync(u => u.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Custom User Queries

    /// <summary>
    /// Get all users with pagination
    /// </summary>
    public async Task<IEnumerable<User>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10)
    {
        return await _dbSet
            .Where(u => u.IsDeleted == false || u.IsDeleted == null)
            .OrderByDescending(u => u.Created_On)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get total count of all users
    /// </summary>
    public async Task<int> GetTotalUsersCountAsync()
    {
        return await _dbSet
            .Where(u => u.IsDeleted == false || u.IsDeleted == null)
            .CountAsync();
    }

    /// <summary>
    /// Get only active (non-deleted) users
    /// </summary>
    public async Task<IEnumerable<User>> GetActiveUsersAsync()
    {
        return await _dbSet
            .Where(u => u.IsDeleted == false || u.IsDeleted == null)
            .OrderBy(u => u.Name)
            .ToListAsync();
    }

    /// <summary>
    /// Get only soft-deleted users
    /// </summary>
    public async Task<IEnumerable<User>> GetDeletedUsersAsync()
    {
        return await _dbSet
            .Where(u => u.IsDeleted == true)
            .OrderByDescending(u => u.UpdatedOn)
            .ToListAsync();
    }

    /// <summary>
    /// Get user by email
    /// </summary>
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email == email && (u.IsDeleted == false || u.IsDeleted == null));
    }

    /// <summary>
    /// Get user by username
    /// </summary>
    public async Task<User?> GetUserByUserNameAsync(string userName)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.UserName == userName && (u.IsDeleted == false || u.IsDeleted == null));
    }

    /// <summary>
    /// Get users with loyalty points above a threshold
    /// </summary>
    public async Task<IEnumerable<User>> GetUsersByLoyaltyPointsAsync(int minPoints)
    {
        return await _dbSet
            .Where(u => u.LoyaltyPoints >= minPoints && (u.IsDeleted == false || u.IsDeleted == null))
            .OrderByDescending(u => u.LoyaltyPoints)
            .ToListAsync();
    }

    /// <summary>
    /// Check if email is already taken
    /// </summary>
    public async Task<bool> IsEmailTakenAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }

    /// <summary>
    /// Check if username is already taken
    /// </summary>
    public async Task<bool> IsUserNameTakenAsync(string userName)
    {
        return await _dbSet.AnyAsync(u => u.UserName == userName);
    }

    #endregion
    #region Admin-Specific Queries

    /// <summary>
    /// Get user with all related data (orders, reviews, redemptions)
    /// </summary>
    public async Task<User?> GetUserWithDetailsAsync(string id)
    {
        return await _dbSet
            .Include(u => u.orders)
            .Include(u => u.reviews)
            .Include(u => u.redemptions)
            .Include(u => u.cart)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    /// <summary>
    /// Search users by name, username, or email
    /// </summary>
    public async Task<IEnumerable<User>> SearchUsersAsync(string? searchTerm, int pageNumber = 1, int pageSize = 20)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearch = searchTerm.ToLower();
            query = query.Where(u =>
                (u.Name != null && u.Name.ToLower().Contains(lowerSearch)) ||
                u.UserName.ToLower().Contains(lowerSearch) ||
                u.Email.ToLower().Contains(lowerSearch));
        }

        return await query
            .OrderByDescending(u => u.Created_On)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get count of active users
    /// </summary>
    public async Task<int> GetActiveUsersCountAsync()
    {
        return await _dbSet
            .Where(u => u.IsDeleted == false || u.IsDeleted == null)
            .CountAsync();
    }

    /// <summary>
    /// Get count of banned users (IsDeleted = true)
    /// </summary>
    public async Task<int> GetBannedUsersCountAsync()
    {
        return await _dbSet
            .Where(u => u.IsDeleted == true)
            .CountAsync();
    }

    #endregion
}

