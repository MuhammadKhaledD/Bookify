using System.Security.Claims;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationOrganizersController : ControllerBase
    {
        private readonly OrganizationOrganizersService organizationOrganizersService;

        public OrganizationOrganizersController(OrganizationOrganizersService organizationOrganizersService)
        {
            this.organizationOrganizersService = organizationOrganizersService;
        }
        [Authorize(Roles = "Admin,Organizer")]
        [HttpGet("organizerOrgnizations")]
        public async Task<IActionResult> GetUserOrganization()
        {
            try
            {
                // Get the current user's ID from the claims
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized("User not authenticated");

                // Convert int userId to string if needed, or use currentUserId directly
                var (organizations, error) = await organizationOrganizersService.GetOrganizerOrganization(currentUserId);

                if (error != null)
                    return BadRequest(new { message = error });

                if (organizations == null || !organizations.Any())
                    return NotFound(new { message = "No organizations found for this organizer" });

                return Ok(new { data = organizations });
            }
            catch (Exception ex)
            {
                // Log the exception here if you have a logger
                return StatusCode(500, new { message = "An error occurred while retrieving organizations", error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Organizer")]
        [HttpGet("organization/{orgId}/organizers")]
        public async Task<IActionResult> GetOrganizationOrganizers(int orgId)
        {
            try
            {
                // Get the current user's ID and role from claims
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdmin = User.IsInRole("Admin");

                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized(new { message = "User not authenticated" });

                // If user is not admin, verify they belong to this organization
                if (!isAdmin)
                {
                    var (userOrgs, userOrgError) = await organizationOrganizersService.GetOrganizerOrganization(currentUserId);

                    if (userOrgError != null)
                        return BadRequest(new { message = userOrgError });

                    if (userOrgs == null || !userOrgs.Any(o => o.OrgId == orgId))
                        return Forbid("You are not authorized for this organization"); // User is not part of this organization
                }

                // Get organizers for the organization
                var (organizers, error) = await organizationOrganizersService.GetOrganizationOrganizers(orgId);

                if (error != null)
                    return BadRequest(new { message = error });

                if (organizers == null || !organizers.Any())
                    return NotFound(new { message = "No organizers found for this organization" });

                return Ok(new { data = organizers });
            }
            catch (Exception ex)
            {
                // Log the exception here if you have a logger
                return StatusCode(500, new { message = "An error occurred while retrieving organizers", error = ex.Message });
            }
        }
    }
}
