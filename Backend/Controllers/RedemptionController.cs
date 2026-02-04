using System.Security.Claims;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/redemptions")]
[Authorize]
public class RedemptionsController : ControllerBase
{
    private readonly RedemptionService _redemptionService;

    public RedemptionsController(RedemptionService redemptionService)
    {
        _redemptionService = redemptionService;
    }

    // --------------------
    // POST /api/redemptions
    // --------------------
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRedemptionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var redemption = await _redemptionService.CreateAsync(userId, request.RewardId);
        return Ok(redemption);
    }

    // --------------------
    // GET /api/redemptions/me
    // --------------------
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var redemptions = await _redemptionService.GetMyRedemptionsAsync(userId);
        return Ok(redemptions);
    }

    // --------------------
    // GET /api/redemptions/product/{id}
    // --------------------
    [HttpGet("product/{id:int}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> GetByProduct(int id)
    {
        var redemptions = await _redemptionService.GetByProductIdAsync(id);
        return Ok(redemptions);
    }

    // --------------------
    // GET /api/redemptions/ticket/{id}
    // --------------------
    [HttpGet("ticket/{id:int}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> GetByTicket(int id)
    {
        var redemptions = await _redemptionService.GetByTicketIdAsync(id);
        return Ok(redemptions);
    }
}

// --------------------
// Request model
// --------------------
public class CreateRedemptionRequest
{
    public int RewardId { get; set; }
}
