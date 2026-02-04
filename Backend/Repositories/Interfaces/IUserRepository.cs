﻿using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// User-specific repository interface with custom queries
/// </summary>
public interface IUserRepository
{
    // Basic CRUD (Note: User ID is string from Identity)
    Task<User?> GetByIdAsync(string id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> AddAsync(User entity);
    Task UpdateAsync(User entity);
    Task DeleteAsync(User entity);
    Task<bool> ExistsAsync(string id);
    Task<int> CountAsync();

    // Custom user queries
    Task<IEnumerable<User>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 10);
    Task<int> GetTotalUsersCountAsync();
    Task<IEnumerable<User>> GetActiveUsersAsync();
    Task<IEnumerable<User>> GetDeletedUsersAsync();
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByUserNameAsync(string userName);
    Task<IEnumerable<User>> GetUsersByLoyaltyPointsAsync(int minPoints);
    Task<bool> IsEmailTakenAsync(string email);
    Task<bool> IsUserNameTakenAsync(string userName);
    Task<User?> GetUserWithDetailsAsync(string id);

    Task<IEnumerable<User>> SearchUsersAsync(string? searchTerm, int pageNumber = 1, int pageSize = 20);

    Task<int> GetActiveUsersCountAsync();

    Task<int> GetBannedUsersCountAsync();

}


