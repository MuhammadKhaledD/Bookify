using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Bookify_Backend.DTOs;
using Bookify_Backend.Services;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")] // Only admins can access these endpoints
    public class UserManagementController : ControllerBase
    {
        private readonly UserManagementService _userManagementService;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            UserManagementService userManagementService,
            ILogger<UserManagementController> logger)
        {
            _userManagementService = userManagementService;
            _logger = logger;
        }

        #region User Retrieval

        /// <summary>
        /// GET api/admin/users
        /// Get all users with optional filtering
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserSearchDto searchDto)
        {
            try
            {
                var users = await _userManagementService.GetAllUsersAsync(searchDto);

                if (users == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving users." });

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllUsers endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/admin/users/active
        /// Get all active users
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveUsers()
        {
            try
            {
                var users = await _userManagementService.GetActiveUsersAsync();

                if (users == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving active users." });

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActiveUsers endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/admin/users/banned
        /// Get all banned users
        /// </summary>
        [HttpGet("banned")]
        public async Task<IActionResult> GetBannedUsers()
        {
            try
            {
                var users = await _userManagementService.GetBannedUsersAsync();

                if (users == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving banned users." });

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBannedUsers endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/admin/users/admins
        /// Get all admin users
        /// </summary>
        [HttpGet("admins")]
        public async Task<IActionResult> GetAdminUsers()
        {
            try
            {
                var users = await _userManagementService.GetAdminUsersAsync();

                if (users == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving admin users." });

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAdminUsers endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/admin/users/organizers
        /// Get all organizer users
        /// </summary>
        [HttpGet("organizers")]
        public async Task<IActionResult> GetOrganizerUsers()
        {
            try
            {
                var users = await _userManagementService.GetOrganizerUsersAsync();

                if (users == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving organizer users." });

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetOrganizerUsers endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/admin/users/{id}
        /// Get user by ID with detailed information
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { message = "User ID is required." });

                var user = await _userManagementService.GetUserByIdAsync(id);

                if (user == null)
                    return NotFound(new { message = "User not found." });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserById endpoint for user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        #endregion

        #region User Statistics

        /// <summary>
        /// GET api/admin/users/statistics
        /// Get user statistics dashboard
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetUserStatistics()
        {
            try
            {
                var stats = await _userManagementService.GetUserStatisticsAsync();

                if (stats == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving statistics." });

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserStatistics endpoint");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        #endregion

        #region User Management

        /// <summary>
        /// PUT api/admin/users/{id}
        /// Update user information
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] AdminUpdateUserDto updateDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { message = "User ID is required." });

                if (updateDto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var updatedUser = await _userManagementService.UpdateUserAsync(id, updateDto);

                if (updatedUser == null)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "User updated successfully.", data = updatedUser });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation in UpdateUser for user {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateUser endpoint for user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// POST api/admin/users/{id}/ban
        /// Ban a user immediately
        /// </summary>
        [HttpPost("{id}/ban")]
        public async Task<IActionResult> BanUser(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { message = "User ID is required." });

                var result = await _userManagementService.BanUserAsync(id);

                if (!result)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "User banned successfully." });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation in BanUser for user {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in BanUser endpoint for user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// POST api/admin/users/{id}/unban
        /// Unban a user
        /// </summary>
        [HttpPost("{id}/unban")]
        public async Task<IActionResult> UnbanUser(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { message = "User ID is required." });

                var result = await _userManagementService.UnbanUserAsync(id);

                if (!result)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "User unbanned successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UnbanUser endpoint for user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// DELETE api/admin/users/{id}/permanent
        /// Permanently delete a user (hard delete)
        /// </summary>
        [HttpDelete("{id}/permanent")]
        public async Task<IActionResult> DeleteUserPermanently(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { message = "User ID is required." });

                var result = await _userManagementService.DeleteUserPermanentlyAsync(id);

                if (!result)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "User permanently deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation in DeleteUserPermanently for user {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteUserPermanently endpoint for user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        #endregion
    }
}