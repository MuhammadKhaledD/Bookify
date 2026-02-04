using System;
using System.Threading.Tasks;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;
using static Bookify_Backend.DTOs.OrganizationDTO;

namespace Bookify_Backend.Controllers
{
    [ApiController]
    [Route("api/organizations")]
    public class OrganizationsController : ControllerBase
    {
        private readonly OrganizationService _organizationService;

        public OrganizationsController(OrganizationService organizationService)
        {
            _organizationService = organizationService;
        }

        /// <summary>
        /// GET api/organizations
        /// Get all organizations
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllOrganizations()
        {
            try
            {
                var organizations = await _organizationService.GetAllOrganizationsAsync();

                if (organizations == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving organizations." });

                return Ok(organizations);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/organizations/{id}
        /// Get organization by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrganizationById(int id)
        {
            try
            {
                var organization = await _organizationService.GetOrganizationByIdAsync(id);

                if (organization == null)
                    return NotFound(new { message = "Organization not found." });

                return Ok(organization);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// POST api/organizations
        /// Create a new organization
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var organization = await _organizationService.CreateOrganizationAsync(dto);

                if (organization == null)
                    return BadRequest(new { message = "Failed to create organization. Please check that all fields are valid and name is unique." });

                return CreatedAtAction(nameof(GetOrganizationById), new { id = organization.Id }, organization);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// PUT api/organizations/{id}
        /// Update an existing organization
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganization(int id, [FromBody] UpdateOrganizationDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var organization = await _organizationService.UpdateOrganizationAsync(id, dto);

                if (organization == null)
                    return BadRequest(new { message = "Failed to update organization. Organization not found or validation failed." });

                return Ok(new { message = "Organization updated successfully.", data = organization });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// DELETE api/organizations/{id}
        /// Delete an organization (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganization(int id)
        {
            try
            {
                var result = await _organizationService.DeleteOrganizationAsync(id);

                if (!result)
                    return NotFound(new { message = "Organization not found." });

                return Ok(new { message = "Organization deleted successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}