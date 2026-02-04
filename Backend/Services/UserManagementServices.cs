using Bookify_Backend.DataBase;
using Bookify_Backend.DTOs;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Bookify_Backend.Services;
using Bookify_Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Services;

/// <summary>
/// Service implementation for User Management (Admin operations)
/// </summary>
public class UserManagementService
{
    private readonly IUserRepository _userRepo;
    private readonly RoleServices _roleServices;
    private readonly DBContext _context;
    private readonly ILogger<UserManagementService> _logger;

    public IOrganizationOrganizerRepository OrganizationOrganizerRepo { get; }

    public UserManagementService(
        IUserRepository userRepo,
        RoleServices roleServices,
        DBContext context,
        ILogger<UserManagementService> logger,IOrganizationOrganizerRepository organizationOrganizerRepo)
    {
        _userRepo = userRepo;
        _roleServices = roleServices;
        _context = context;
        _logger = logger;
        OrganizationOrganizerRepo = organizationOrganizerRepo;
    }

    #region User Retrieval

    public async Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync(UserSearchDto searchDto)
    {
        try
        {
            IEnumerable<Bookify_Backend.Entities.User> users;

            // Apply filtering based on filter type
            switch (searchDto.FilterType)
            {
                case UserFilterType.Active:
                    return await GetActiveUsersAsync();

                case UserFilterType.Banned:
                    return await GetBannedUsersAsync();

                case UserFilterType.Admins:
                    return await GetAdminUsersAsync();

                case UserFilterType.Organizers:
                    return await GetOrganizerUsersAsync();

                case UserFilterType.RegularUsers:
                    return await GetRegularUsersAsync();

                case UserFilterType.UnconfirmedEmail:
                    return await GetUnconfirmedEmailUsersAsync();

                default: // All users
                    if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                    {
                        users = await _userRepo.SearchUsersAsync(searchDto.SearchTerm);
                    }
                    else
                    {
                        users = await _context.Users
                            .OrderByDescending(u => u.Created_On)
                            .ToListAsync();
                    }
                    break;
            }

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in users)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            throw;
        }
    }

    public async Task<IEnumerable<UserSummaryDto>> GetActiveUsersAsync()
    {
        try
        {
            var users = await _context.Users
                .Where(u => u.IsDeleted == false || u.IsDeleted == null)
                .OrderByDescending(u => u.Created_On)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in users)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active users");
            throw;
        }
    }

    public async Task<IEnumerable<UserSummaryDto>> GetBannedUsersAsync()
    {
        try
        {
            var users = await _context.Users
                .Where(u => u.IsDeleted == true)
                .OrderByDescending(u => u.UpdatedOn)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in users)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving banned users");
            throw;
        }
    }

    public async Task<IEnumerable<UserSummaryDto>> GetAdminUsersAsync()
    {
        try
        {
            var allUsers = await _context.Users
                .Where(u => u.IsDeleted == false || u.IsDeleted == null)
                .OrderByDescending(u => u.Created_On)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in allUsers)
            {
                if (await _roleServices.IsUserInRoleAsync(user.Id, "Admin"))
                {
                    var roles = await _roleServices.GetUserRolesAsync(user.Id);
                    userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
                }
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving admin users");
            throw;
        }
    }

    public async Task<IEnumerable<UserSummaryDto>> GetOrganizerUsersAsync()
    {
        try
        {
            var allUsers = await _context.Users
                .Where(u => u.IsDeleted == false || u.IsDeleted == null)
                .OrderByDescending(u => u.Created_On)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in allUsers)
            {
                if (await _roleServices.IsUserInRoleAsync(user.Id, "Organizer"))
                {
                    var roles = await _roleServices.GetUserRolesAsync(user.Id);
                    userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
                }
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organizer users");
            throw;
        }
    }

    private async Task<IEnumerable<UserSummaryDto>> GetRegularUsersAsync()
    {
        try
        {
            var allUsers = await _context.Users
                .Where(u => u.IsDeleted == false || u.IsDeleted == null)
                .OrderByDescending(u => u.Created_On)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in allUsers)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                var roleNames = roles?.Select(r => r.RoleName).ToList() ?? new List<string>();

                // Regular users: only have "User" role
                if (roleNames.Count == 1 && roleNames.Contains("User"))
                {
                    userDtos.Add(MapToUserSummaryDto(user, roleNames));
                }
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving regular users");
            throw;
        }
    }

    private async Task<IEnumerable<UserSummaryDto>> GetUnconfirmedEmailUsersAsync()
    {
        try
        {
            var users = await _context.Users
                .Where(u => !u.EmailConfirmed && (u.IsDeleted == false || u.IsDeleted == null))
                .OrderByDescending(u => u.Created_On)
                .ToListAsync();

            var userDtos = new List<UserSummaryDto>();
            foreach (var user in users)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                userDtos.Add(MapToUserSummaryDto(user, roles?.Select(r => r.RoleName).ToList()));
            }

            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unconfirmed email users");
            throw;
        }
    }

    public async Task<UserDetailDto?> GetUserByIdAsync(string userId)
    {
        try
        {
            var user = await _userRepo.GetUserWithDetailsAsync(userId);
            if (user == null)
                return null;

            var roles = await _roleServices.GetUserRolesAsync(user.Id);

            return new UserDetailDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                ProfilePicture = user.ProfilePicture,
                Address = user.Address,
                LoyaltyPoints = user.LoyaltyPoints,
                CreatedOn = user.Created_On,
                UpdatedOn = user.UpdatedOn,
                IsBanned = user.IsDeleted ?? false,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumber = user.PhoneNumber,
                Roles = roles?.Select(r => r.RoleName).ToList() ?? new List<string>(),
                TotalOrders = user.orders?.Count ?? 0,
                TotalReviews = user.reviews?.Count ?? 0,
                TotalRedemptions = user.redemptions?.Count ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user details for {UserId}", userId);
            throw;
        }
    }
    #endregion

    #region User Statistics

    public async Task<UserStatsDto> GetUserStatisticsAsync()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _userRepo.GetActiveUsersCountAsync();
            var bannedUsers = await _userRepo.GetBannedUsersCountAsync();
            var unconfirmedEmail = await _context.Users
                .Where(u => !u.EmailConfirmed && (u.IsDeleted == false || u.IsDeleted == null))
                .CountAsync();

            // Count users by role
            var allActiveUsers = await _context.Users
                .Where(u => u.IsDeleted == false || u.IsDeleted == null)
                .ToListAsync();

            int adminCount = 0, organizerCount = 0, regularCount = 0;

            foreach (var user in allActiveUsers)
            {
                var roles = await _roleServices.GetUserRolesAsync(user.Id);
                var roleNames = roles?.Select(r => r.RoleName).ToList() ?? new List<string>();

                if (roleNames.Contains("Admin"))
                    adminCount++;
                else if (roleNames.Contains("Organizer"))
                    organizerCount++;
                else if (roleNames.Count == 1 && roleNames.Contains("User"))
                    regularCount++;
            }

            return new UserStatsDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                BannedUsers = bannedUsers,
                AdminUsers = adminCount,
                OrganizerUsers = organizerCount,
                RegularUsers = regularCount,
                UsersWithUnconfirmedEmail = unconfirmedEmail
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user statistics");
            throw;
        }
    }

    #endregion

    #region User Management

    public async Task<UserDetailDto?> UpdateUserAsync(string userId, AdminUpdateUserDto updateDto)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return null;

            // Update user properties
            if (!string.IsNullOrWhiteSpace(updateDto.Name) ||
                !string.IsNullOrWhiteSpace(updateDto.UserName) ||
                !string.IsNullOrWhiteSpace(updateDto.ProfilePicture) ||
                !string.IsNullOrWhiteSpace(updateDto.Address))
            {
                user.UpdateProfile(
                    updateDto.UserName,
                    updateDto.Name,
                    updateDto.ProfilePicture,
                    updateDto.Address
                );
            }

            // Update email if changed
            if (!string.IsNullOrWhiteSpace(updateDto.Email) && updateDto.Email != user.Email)
            {
                // Check if email is already taken
                if (await _userRepo.IsEmailTakenAsync(updateDto.Email))
                    throw new InvalidOperationException("Email is already taken");

                typeof(Bookify_Backend.Entities.User).GetProperty("Email")!.SetValue(user, updateDto.Email);
                typeof(Bookify_Backend.Entities.User).GetProperty("EmailConfirmed")!.SetValue(user, false);
            }

            // Update loyalty points
            if (updateDto.LoyaltyPoints.HasValue)
            {
                var currentPoints = user.LoyaltyPoints;
                var difference = updateDto.LoyaltyPoints.Value - currentPoints;

                if (difference > 0)
                    user.AddLoyaltyPoints(difference);
                else if (difference < 0)
                    user.DeductLoyaltyPoints(Math.Abs(difference));
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated by admin", userId);

            return await GetUserByIdAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> BanUserAsync(string userId, string? reason = null)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return false;

            // Check if user is admin - admins cannot be banned
            var isAdmin = await _roleServices.IsUserInRoleAsync(userId, "Admin");
            if (isAdmin)
            {
                _logger.LogWarning("Attempt to ban admin user {UserId}", userId);
                throw new InvalidOperationException("Cannot ban an admin user");
            }

            // Ban user
            user.BanUser();
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} banned. Reason: {Reason}", userId, reason ?? "No reason provided");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error banning user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> UnbanUserAsync(string userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return false;

            // Unban user
            typeof(Bookify_Backend.Entities.User).GetProperty("IsDeleted")!.SetValue(user, false);
            typeof(Bookify_Backend.Entities.User).GetProperty("UpdatedOn")!.SetValue(user,
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified));

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} unbanned", userId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unbanning user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> DeleteUserPermanentlyAsync(string userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return false;

            // Check if user is admin - admins cannot be deleted
            var isAdmin = await _roleServices.IsUserInRoleAsync(userId, "Admin");
            if (isAdmin)
            {
                _logger.LogWarning("Attempt to permanently delete admin user {UserId}", userId);
                throw new InvalidOperationException("Cannot delete an admin user");
            }

            await _userRepo.DeleteAsync(user);
            await _context.SaveChangesAsync();

            _logger.LogWarning("User {UserId} permanently deleted", userId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error permanently deleting user {UserId}", userId);
            throw;
        }
    }

    #endregion

    #region Helper Methods

    private UserSummaryDto MapToUserSummaryDto(Bookify_Backend.Entities.User user, List<string>? roles)
    {
        return new UserSummaryDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Name = user.Name,
            Email = user.Email,
            ProfilePicture = user.ProfilePicture,
            LoyaltyPoints = user.LoyaltyPoints,
            CreatedOn = user.Created_On,
            IsBanned = user.IsDeleted ?? false,
            EmailConfirmed = user.EmailConfirmed,
            Roles = roles ?? new List<string>()
        };
    }

    #endregion
}