using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/stores")]
public class StoresController : ControllerBase
{
    private readonly StoreService _storeService;

    public StoresController(StoreService storeService)
    {
        _storeService = storeService;
    }

    /// <summary>
    /// Create a new store
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
    {
        var store = await _storeService.CreateStoreAsync(
            request.OrgId,
            request.Name,
            request.Description,
            request.Status,
            request.StoreLogo
        );

        if (store == null)
        {
            return BadRequest(new { message = "Failed to create store. Name is required and organization must exist if provided." });
        }

        return CreatedAtAction(nameof(GetStoreById), new { id = store.Id }, store);
    }

    /// <summary>
    /// Get store by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetStoreById(int id)
    {
        var store = await _storeService.GetStoreByIdAsync(id);

        if (store == null)
        {
            return NotFound(new { message = "Store not found" });
        }

        return Ok(store);
    }
    
    
    /// <summary>
    /// Get store by OrgID
    /// </summary>
    [HttpGet("by-org/{id}")]
    public async Task<IActionResult> GetStoreByOrgId(int id)
    {
        var store = await _storeService.GetStoreByOrgIdAsync(id);

        if (store == null)
        {
            return NotFound(new { message = "Store not found" });
        }

        return Ok(store);
    }


    /// <summary>
    /// Update an existing store
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStore(int id, [FromBody] UpdateStoreRequest request)
    {
        var result = await _storeService.UpdateStoreAsync(
            id,
            request.Name,
            request.Description,
            request.Status,
            request.StoreLogo
        );

        if (!result)
        {
            return NotFound(new { message = "Store not found" });
        }

        return Ok(new { message = "Store updated successfully" });
    }

    /// <summary>
    /// Delete a store
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStore(int id)
    {
        var result = await _storeService.DeleteStoreAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Store not found" });
        }

        return Ok(new { message = "Store deleted successfully" });
    }
}

// Simple request classes
public class CreateStoreRequest
{
    public int? OrgId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool Status { get; set; } = true;
    public string? StoreLogo { get; set; }
}

public class UpdateStoreRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? Status { get; set; }
    public string? StoreLogo { get; set; }
}

