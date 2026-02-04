using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Bookify_Backend.DTOs.RolesDTO;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RoleController : ControllerBase
{
    private readonly RoleServices _roleServices;
    private readonly ILogger<RoleController> _logger;

    public RoleController(RoleServices roleServices, ILogger<RoleController> logger)
    {
        _roleServices = roleServices;
        _logger = logger;
    }

    #region Role Management

    [HttpPost("CreateRole")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDTO model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid model state",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            var result = await _roleServices.CreateRole(model);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to create role",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            _logger.LogInformation("Role '{RoleName}' created successfully", model.RoleName);

            return Ok(new
            {
                success = true,
                message = $"Role '{model.RoleName}' created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while creating the role"
            });
        }
    }

    [HttpGet("GetAllRoles")]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _roleServices.GetAllRoles();

            if (roles == null || !roles.Any())
            {
                return Ok(new
                {
                    success = true,
                    message = "No roles found",
                    data = new List<RoleDTO>()
                });
            }

            return Ok(new
            {
                success = true,
                message = "Roles retrieved successfully",
                data = roles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving roles");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while retrieving roles"
            });
        }
    }

    [HttpGet("GetRoleById/{roleId}")]
    public async Task<IActionResult> GetRoleById(string roleId)
    {
        try
        {
            if (string.IsNullOrEmpty(roleId))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Role ID cannot be null or empty"
                });
            }

            var role = await _roleServices.GetRoleByIdAsync(roleId);

            if (role == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Role with ID '{roleId}' not found"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Role retrieved successfully",
                data = new
                {
                    roleId = role.Id,
                    roleName = role.Name
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role {RoleId}", roleId);
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while retrieving the role"
            });
        }
    }

    #endregion

    #region User-Role Assignment

    
    [HttpGet("GetUsersInRole/{roleId}")]
    public async Task<IActionResult> GetUsersInRole(string roleId)
    {
        try
        {
            if (string.IsNullOrEmpty(roleId))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Role ID cannot be null or empty"
                });
            }

            // Check if role exists
            var role = await _roleServices.GetRoleByIdAsync(roleId);
            if (role == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Role with ID '{roleId}' not found"
                });
            }

            var users = await _roleServices.GetUsersInRoleAsync(roleId);

            if (users == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Could not retrieve users for role '{roleId}'"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Users retrieved successfully",
                data = new
                {
                    roleId = roleId,
                    roleName = role.Name,
                    users = users
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users in role {RoleId}", roleId);
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while retrieving users"
            });
        }
    }

    [HttpPut("UpdateUsersInRole/{roleId}")]
    public async Task<IActionResult> UpdateUsersInRole(string roleId, [FromBody] List<UserRoleDTO> model)
    {
        try
        {
            if (string.IsNullOrEmpty(roleId))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Role ID cannot be null or empty"
                });
            }

            if (model == null || !model.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "User list cannot be empty"
                });
            }

            // Check if role exists
            var role = await _roleServices.GetRoleByIdAsync(roleId);
            if (role == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Role with ID '{roleId}' not found"
                });
            }

            var result = await _roleServices.UpdateUsersInRoleAsync(model, roleId);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Failed to update users in role {RoleId}: {Errors}", roleId, string.Join(", ", errors));

                return BadRequest(new
                {
                    success = false,
                    message = "Some errors occurred while updating role assignments",
                    errors = errors
                });
            }

            _logger.LogInformation("Successfully updated user assignments for role {RoleId}", roleId);

            return Ok(new
            {
                success = true,
                message = "User role assignments updated successfully",
                data = new
                {
                    roleId = roleId,
                    roleName = role.Name,
                    updatedCount = model.Count
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating users in role {RoleId}", roleId);
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while updating role assignments"
            });
        }
    }

    [HttpPost("AddUserToRole")]
    public async Task<IActionResult> AddUserToRole([FromBody] AddUserToRoleDTO model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid model state",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            // Check if role exists
            var role = await _roleServices.GetRoleByIdAsync(model.RoleId);
            if (role == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Role with ID '{model.RoleId}' not found"
                });
            }

            // Create list with single user to add
            var userList = new List<UserRoleDTO>
            {
                new UserRoleDTO
                {
                    UserId = model.UserId,
                    IsSelected = true
                }
            };

            var result = await _roleServices.UpdateUsersInRoleAsync(userList, model.RoleId,model.OrganizationId);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to add user to role",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            _logger.LogInformation("User {UserId} added to role {RoleId}", model.UserId, model.RoleId);

            return Ok(new
            {
                success = true,
                message = $"User added to role '{role.Name}' successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user to role");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while adding user to role"
            });
        }
    }
    

    #endregion
    
    [HttpPost("RemoveUserFromRole")]
    public async Task<IActionResult> RemoveUserFromRole([FromBody] RemoveUserFromRoleDTO model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid model state",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            var result = await _roleServices.RemoveUserFromRoleAsync(model.UserId, model.RoleId);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = result.Message
                });
            }

            _logger.LogInformation("User {UserId} removed from role {RoleId}. User deleted: {UserDeleted}", 
                model.UserId, model.RoleId, result.UserDeleted);

            return Ok(new
            {
                success = true,
                message = result.Message,
                userDeleted = result.UserDeleted
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user from role");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while removing user from role"
            });
        }
    }
}

