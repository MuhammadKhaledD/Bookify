﻿﻿using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly EventService _eventService;

    public EventsController(EventService eventService)
    {
        _eventService = eventService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllEvents()
    {
        var result = await _eventService.GetAllEventsAsync();
        return Ok(result);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEventById(int id)
    {
        var result = await _eventService.GetEventByIdAsync(id);
        
        if (result == null)
            return NotFound(new { message = "Event not found" });
        
        return Ok(result);
    }

    /// <summary>
    /// Create a new event
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromForm] CreateEventRequest request)
    {
        var (newEvent, error) = await _eventService.CreateEventAsync(
            request.OrgId,
            request.CategoryId,
            request.Title,
            request.Description,
            request.LocationAddress,
            request.EventDate,
            request.Capacity,
            request.LocationName,
            request.AgeRestriction,
            request.ImageUrl
        );

        if (newEvent == null)
        {
            return BadRequest(new { message = error ?? "Failed to create event. Organization and Category must exist." });
        }

        // Return simple response to avoid circular reference issues
        return CreatedAtAction(nameof(GetEventById), new { id = newEvent.Id }, new 
        { 
            id = newEvent.Id,
            message = "Event created successfully" 
        });
    }

    /// <summary>
    /// Update an existing event
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(int id, [FromForm] UpdateEventRequest request)
    {
        var result = await _eventService.UpdateEventAsync(
            id,
            request.Title,
            request.Description,
            request.LocationName,
            request.LocationAddress,
            request.EventDate,
            request.Capacity,
            request.AgeRestriction,
            request.ImageUrl,
            request.Status
        );

        if (!result)
        {
            return NotFound(new { message = "Event not found" });
        }

        return Ok(new { message = "Event updated successfully" });
    }

    /// <summary>
    /// Delete an event (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        var result = await _eventService.DeleteEventAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Event not found" });
        }

        return Ok(new { message = "Event deleted successfully" });
    }
}

// Simple request classes
public class CreateEventRequest
{
    public int OrgId { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LocationAddress { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int Capacity { get; set; }
    public string? LocationName { get; set; }
    public int? AgeRestriction { get; set; }
    public IFormFile? ImageUrl { get; set; }
}

public class UpdateEventRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? LocationName { get; set; }
    public string? LocationAddress { get; set; }
    public DateTime? EventDate { get; set; }
    public int? Capacity { get; set; }
    public int? AgeRestriction { get; set; }
    public IFormFile? ImageUrl { get; set; }
    public string? Status { get; set; }
}

