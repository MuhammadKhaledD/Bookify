﻿using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/shops")]
public class ShopsController : ControllerBase
{
    private readonly ShopService _shopService;

    public ShopsController(ShopService shopService)
    {
        _shopService = shopService;
    }

    /// <summary>
    /// Create a new shop
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateShop([FromBody] CreateShopRequest request)
    {
        var shop = await _shopService.CreateShopAsync(
            request.EventId,
            request.Name,
            request.Description,
            request.Status,
            request.ShopLogo
        );

        if (shop == null)
        {
            return BadRequest(new { message = "Failed to create shop. Name is required and event must exist if provided." });
        }

        return CreatedAtAction(nameof(GetShopById), new { id = shop.Id }, shop);
    }

    /// <summary>
    /// Get shop by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetShopById(int id)
    {
        var shop = await _shopService.GetShopByIdAsync(id);

        if (shop == null)
        {
            return NotFound(new { message = "Shop not found" });
        }

        return Ok(shop);
    }

    /// <summary>
    /// Get shop by event ID
    /// </summary>
    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetShopByEventId(int eventId)
    {
        var shop = await _shopService.GetShopByEventIdAsync(eventId);

        if (shop == null)
        {
            return NotFound(new { message = "Shop not found for this event" });
        }

        return Ok(shop);
    }

    /// <summary>
    /// Update an existing shop
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShop(int id, [FromBody] UpdateShopRequest request)
    {
        var result = await _shopService.UpdateShopAsync(
            id,
            request.Name,
            request.Description,
            request.Status,
            request.ShopLogo
        );

        if (!result)
        {
            return NotFound(new { message = "Shop not found" });
        }

        return Ok(new { message = "Shop updated successfully" });
    }

    /// <summary>
    /// Delete a shop
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShop(int id)
    {
        var result = await _shopService.DeleteShopAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Shop not found" });
        }

        return Ok(new { message = "Shop deleted successfully" });
    }
}

// Simple request classes
public class CreateShopRequest
{
    public int? EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool Status { get; set; } = true;
    public string? ShopLogo { get; set; }
}

public class UpdateShopRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? Status { get; set; }
    public string? ShopLogo { get; set; }
}

