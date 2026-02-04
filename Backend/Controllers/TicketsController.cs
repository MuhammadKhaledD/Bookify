using Bookify_Backend.DTOs;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }
    
    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetTicketsByEventId(int eventId)
    {
        var tickets = await _ticketService.GetTicketsByEventIdAsync(eventId);
        return Ok(tickets);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicketById(int id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        
        if (ticket == null)
            return NotFound(new { message = "Ticket not found" });
        
        return Ok(ticket);
    }
    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.CreateTicketAsync(request);
            return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, [FromBody] UpdateTicketRequest request)
    {
        var ticket = await _ticketService.UpdateTicketAsync(id, request);
        
        if (ticket == null)
            return NotFound(new { message = "Ticket not found" });
        
        return Ok(ticket);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var result = await _ticketService.DeleteTicketAsync(id);
        
        if (!result)
            return NotFound(new { message = "Ticket not found" });
        
        return Ok(new { message = "Ticket deleted successfully" });
    }
}

