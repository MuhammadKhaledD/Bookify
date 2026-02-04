using System.ComponentModel.DataAnnotations;

namespace Bookify_Backend.DTOs;

/// <summary>
/// DTO for user summary (list view)
/// </summary>
public class UserSummaryDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string? Name { get; set; }
    public string Email { get; set; } = null!;
    public string? ProfilePicture { get; set; }
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedOn { get; set; }
    public bool IsBanned { get; set; } // IsDeleted = IsBanned
    public bool EmailConfirmed { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}

/// <summary>
/// DTO for detailed user information
/// </summary>
public class UserDetailDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string? Name { get; set; }
    public string Email { get; set; } = null!;
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public bool IsBanned { get; set; } // IsDeleted = IsBanned
    public bool EmailConfirmed { get; set; }
    public string? PhoneNumber { get; set; }
    public List<string> Roles { get; set; } = new List<string>();

    // Statistics
    public int TotalOrders { get; set; }
    public int TotalReviews { get; set; }
    public int TotalRedemptions { get; set; }
}

/// <summary>
/// DTO for user statistics
/// </summary>
public class UserStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int BannedUsers { get; set; }
    public int AdminUsers { get; set; }
    public int OrganizerUsers { get; set; }
    public int RegularUsers { get; set; }
    public int UsersWithUnconfirmedEmail { get; set; }
}

/// <summary>
/// DTO for updating user profile (Admin)
/// </summary>
public class AdminUpdateUserDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(256)]
    public string? UserName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public string? ProfilePicture { get; set; }

    [Range(0, int.MaxValue)]
    public int? LoyaltyPoints { get; set; }
}

/// <summary>
/// DTO for user search and filter
/// </summary>
public class UserSearchDto
{
    public string? SearchTerm { get; set; }
    public UserFilterType? FilterType { get; set; }
}

/// <summary>
/// Enum for user filter types
/// </summary>
public enum UserFilterType
{
    All,
    Active,
    Banned,
    Admins,
    Organizers,
    RegularUsers,
    UnconfirmedEmail
}

/// <summary>
/// DTO for ban/unban user
/// </summary>
public class BanUserDto
{
    public string? Reason { get; set; }
}