using Bookify_Backend.Entities;
using Bookify_Backend.Repositories;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using static Bookify_Backend.DTOs.RolesDTO;

namespace Bookify_Backend.Services
{
    public class RoleServices
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;
        private readonly ILogger<RoleServices> _logger;
        private readonly IOrganizationOrganizerRepository _organizationOrganizercontext ;
        private readonly IUnitOfWork _unitOfWork;
        public RoleServices(
            RoleManager<IdentityRole> roleManager,
            UserManager<User> userManager,
            IEmailService emailService,
            ILogger<RoleServices> logger,
            IUnitOfWork unitOfWork,
            IOrganizationOrganizerRepository organizationOrganizercontext)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _emailService = emailService;
            _logger = logger;
            _unitOfWork = unitOfWork;
            _organizationOrganizercontext = organizationOrganizercontext;
        }

        public async Task<IdentityResult> CreateRole(CreateRoleDTO model)
        {
            var result = await _roleManager.CreateAsync(new IdentityRole { Name = model.RoleName });
            return result;
        }

        public async Task<List<RoleDTO>?> GetAllRoles()
        {
            try
            {
                var roles = _roleManager.Roles.ToList();
                var rolesWithMetadata = new List<RoleDTO>();

                foreach (var role in roles)
                {
                    rolesWithMetadata.Add(new RoleDTO
                    {
                        RoleId = role.Id,
                        RoleName = role.Name,
                    });
                }

                return rolesWithMetadata.ToList();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<UserRoleDTO>?> GetUsersInRoleAsync(string roleId)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                {
                    return null;
                }

                var model = new List<UserRoleDTO>();
                var users = _userManager.Users.ToList();
                foreach (var user in users)
                {
                    if (user == null) continue;
                    var userRoleDTO = new UserRoleDTO
                    {
                        UserId = user.Id,
                        UserName = user.UserName,
                        ProfilePicture = user.ProfilePicture
                    };

                    try
                    {
                        userRoleDTO.IsSelected = await _userManager.IsInRoleAsync(user, role.Name);
                    }
                    catch (Exception ex)
                    {
                        userRoleDTO.IsSelected = false;
                    }
                    if(userRoleDTO.IsSelected)
                        model.Add(userRoleDTO);
                }

                return model;
            }
            catch (Exception ex)
            {
                return new List<UserRoleDTO>();
            }
        }

        public async Task<IdentityResult> UpdateUsersInRoleAsync(List<UserRoleDTO> model, string roleId ,string? organizationId = null)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                {
                    return IdentityResult.Failed(new IdentityError
                    {
                        Description = "Role not found"
                    });
                }

                var overallResult = IdentityResult.Success;

                foreach (var userRole in model)
                {
                    var user = await _userManager.FindByIdAsync(userRole.UserId);
                    if (user == null)
                    {
                        continue;
                    }

                    var isInRole = await _userManager.IsInRoleAsync(user, role.Name);
                    IdentityResult result = null;

                    if (userRole.IsSelected && !isInRole)
                    {
                        // Adding user to role
                        result = await _userManager.AddToRoleAsync(user, role.Name);
                        if (result.Succeeded)
                        {
                            // If organizationId is provided and role is "Organizer", create OrganizationOrganizer
                            if (!string.IsNullOrEmpty(organizationId) && role.Name.Equals("Organizer", StringComparison.OrdinalIgnoreCase))
                            {
                                if (int.TryParse(organizationId, out int orgId))
                                {
                                    var organizationOrganizer = new OrganizationOrganizer(user.Id, orgId);
                                    await _organizationOrganizercontext.AddAsync(organizationOrganizer);
                                    await _unitOfWork.SaveChangesAsync();
                                }
                            }
        
                            // Send email notification for role assignment
                            await SendRoleAssignmentEmailAsync(user, role.Name, isAdded: true);
                        }
                    }
                    else if (!userRole.IsSelected && isInRole)
                    {
                        // Removing user from role
                        result = await _userManager.RemoveFromRoleAsync(user, role.Name);
                        if (result.Succeeded)
                        {
                            // Send email notification for role removal
                            await SendRoleAssignmentEmailAsync(user, role.Name, isAdded: false);
                        }
                    }

                    if (result != null && !result.Succeeded)
                    {
                        // Combine errors from failed operations
                        var errors = overallResult.Errors.Concat(result.Errors).ToArray();
                        overallResult = IdentityResult.Failed(errors);
                    }
                }

                return overallResult;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<IdentityRole> GetRoleByIdAsync(string roleId)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                return role;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> IsUserInRoleAsync(string userid, string roleName)
        {
            User? user = await _userManager.FindByIdAsync(userid);
            if (user == null)
                return false;
            return await _userManager.IsInRoleAsync(user, roleName);
        }

        public async Task<List<RoleDTO>?> GetUserRolesAsync(string userid)
        {
            User? user = await _userManager.FindByIdAsync(userid);
            if (user == null)
                return null;
            var roles = await _userManager.GetRolesAsync(user);
            var userRoles = new List<RoleDTO>();
            foreach (var roleName in roles)
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                userRoles.Add(new RoleDTO
                {
                    RoleName = role.Name,
                    RoleId = role.Id
                });
            }
            return userRoles;
        }

        private async Task SendRoleAssignmentEmailAsync(User user, string roleName, bool isAdded)
        {
            try
            {
                if (string.IsNullOrEmpty(user.Email))
                {
                    _logger.LogWarning("Cannot send role notification email: User {UserId} has no email address", user.Id);
                    return;
                }

                string subject = isAdded
                    ? $"You've been assigned to the '{roleName}' role"
                    : $"You've been removed from the '{roleName}' role";

                string actionText = isAdded ? "added to" : "removed from";
                string actionColor = isAdded ? "#28a745" : "#dc3545";

                string htmlMessage = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: {actionColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .role-badge {{ background-color: {actionColor}; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }}
        .important-note {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Role Assignment Update</h1>
        </div>
        <div class='content'>
            <p>Hello <strong>{user.UserName}</strong>,</p>
            
            <p>Your role assignments have been updated in Bookify.</p>
            
            <p>You have been <strong>{actionText}</strong> the following role:</p>
            <div class='role-badge'>{roleName}</div>
            
            <div class='important-note'>
                <strong>⚠️ Important:</strong> To access the privileges and features associated with this role change, 
                please <strong>log out and log back in</strong> to your account or wait for an hour from now before you use the website again. This will refresh your permissions.
            </div>
            
            <p>Thank you,<br>The Bookify Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(user.Email, subject, htmlMessage);
                _logger.LogInformation("Role notification email sent to {Email} for role '{Role}' ({Action})",
                    user.Email, roleName, isAdded ? "added" : "removed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send role notification email to user {UserId}", user.Id);
                // Don't throw - email failure shouldn't break the role assignment process
            }
        }
        
        
        public async Task<(bool Success, string Message, bool UserDeleted)> RemoveUserFromRoleAsync(string userId, string roleId)
        {
            try
            {
                // 1. Validate user exists
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return (false, "User not found", false);
                }

                // 2. Validate role exists
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                {
                    return (false, "Role not found", false);
                }

                // 3. Check if user has this role
                var isInRole = await _userManager.IsInRoleAsync(user, role.Name);
                if (!isInRole)
                {
                    return (false, $"User is not in role '{role.Name}'", false);
                }

                // 4. Get all current roles
                var userRoles = await _userManager.GetRolesAsync(user);
                var remainingRoles = userRoles.Where(r => !r.Equals(role.Name, StringComparison.OrdinalIgnoreCase)).ToList();

        // 5. Handle Organizer role removal - delete ALL organization relationships
                if (role.Name.Equals("Organizer", StringComparison.OrdinalIgnoreCase))
                {
                    var orgOrganizers = await _organizationOrganizercontext.GetAllAsync();
                    var userOrgOrganizers = orgOrganizers.Where(oo => oo.UserId == userId).ToList();
            
                    if (userOrgOrganizers.Any())
                    {
                        foreach (var orgOrganizer in userOrgOrganizers)
                        {
                            await _organizationOrganizercontext.DeleteAsync(orgOrganizer);
                        }
                    }
                }

                // 6. Remove the role
                var removeResult = await _userManager.RemoveFromRoleAsync(user, role.Name);
                if (!removeResult.Succeeded)
                {
                    return (false, $"Failed to remove user from role: {string.Join(", ", removeResult.Errors.Select(e => e.Description))}", false);
                }
                // Send email notification for role removal
                await SendRoleAssignmentEmailAsync(user, role.Name, isAdded: false);

                // 7. Check if user should be deleted
                bool shouldDeleteUser = remainingRoles.Count == 0;

                // 8. If removing Organizer role, clean up organization relationships
                if (role.Name.Equals("Organizer", StringComparison.OrdinalIgnoreCase))
                {
                    var userOrgOrganizers = await _organizationOrganizercontext.GetByUserIdAsync(userId);
    
                    if (userOrgOrganizers.Any())
                    {
                        foreach (var orgOrganizer in userOrgOrganizers)
                        {
                            await _organizationOrganizercontext.DeleteAsync(orgOrganizer);
                        }
                    }
                }

                // 9. Delete user if necessary (no roles remaining)
                if (shouldDeleteUser)
                {
                    user.BanUser(); // Soft delete
                    await _userManager.UpdateAsync(user);
                    await _unitOfWork.SaveChangesAsync();
    
                    return (true, $"User removed from role '{role.Name}' and account has been deleted (no remaining roles)", true);
                }

                await _unitOfWork.SaveChangesAsync();
                return (true, $"User removed from role '{role.Name}' successfully", false);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}