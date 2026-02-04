using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

/// <summary>
/// Analytics Controller - Handles business intelligence and reporting queries
/// </summary>
[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Admin")] // Uncomment if you want admin-only access
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(AnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get total earnings per organization (Tickets + Shop Products + Store Products)
    /// </summary>
    [HttpGet("org-earnings")]
    public async Task<IActionResult> GetOrgEarnings()
    {
        try
        {
            var data = await _analyticsService.GetOrgEarningsAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organization earnings");
            return StatusCode(500, new { message = "An error occurred while retrieving organization earnings" });
        }
    }

    /// <summary>
    /// Get attendance (tickets sold) per event
    /// </summary>
    [HttpGet("event-attendance")]
    public async Task<IActionResult> GetEventAttendance()
    {
        try
        {
            var data = await _analyticsService.GetEventAttendanceAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving event attendance");
            return StatusCode(500, new { message = "An error occurred while retrieving event attendance" });
        }
    }

    /// <summary>
    /// Get total users vs active users (who bought at least 1 ticket)
    /// </summary>
    [HttpGet("user-activity")]
    public async Task<IActionResult> GetUserActivity()
    {
        try
        {
            var data = await _analyticsService.GetUserActivityStatsAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user activity stats");
            return StatusCode(500, new { message = "An error occurred while retrieving user activity statistics" });
        }
    }

    /// <summary>
    /// Get total money paid per user
    /// </summary>
    [HttpGet("user-payments")]
    public async Task<IActionResult> GetUserPayments()
    {
        try
        {
            var data = await _analyticsService.GetUserPaymentsAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user payments");
            return StatusCode(500, new { message = "An error occurred while retrieving user payments" });
        }
    }

    /// <summary>
    /// Get top events by revenue (tickets only)
    /// </summary>
    [HttpGet("top-events")]
    public async Task<IActionResult> GetTopEvents()
    {
        try
        {
            var data = await _analyticsService.GetTopEventsByRevenueAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top events by revenue");
            return StatusCode(500, new { message = "An error occurred while retrieving top events" });
        }
    }

    /// <summary>
    /// Get user loyalty summary (orders, spending, points)
    /// </summary>
    [HttpGet("user-loyalty")]
    public async Task<IActionResult> GetUserLoyalty()
    {
        try
        {
            var data = await _analyticsService.GetUserLoyaltySummaryAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user loyalty summary");
            return StatusCode(500, new { message = "An error occurred while retrieving user loyalty data" });
        }
    }

    /// <summary>
    /// Get refundable tickets count per event
    /// </summary>
    /// 
    [HttpGet("org-revenue-breakdown")]
    public async Task<IActionResult> GetOrgRevenueBreakdown()
    {
        try
        {
            var data = await _analyticsService.GetOrgRevenueBreakdownAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organization revenue breakdown");
            return StatusCode(500, new { message = "An error occurred while retrieving revenue breakdown" });
        }
    }

    /// <summary>
    /// Get user engagement scores (events attended, products purchased, reviews written)
    /// </summary>
    [HttpGet("user-engagement")]
    public async Task<IActionResult> GetUserEngagement()
    {
        try
        {
            var data = await _analyticsService.GetUserEngagementScoreAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user engagement scores");
            return StatusCode(500, new { message = "An error occurred while retrieving user engagement data" });
        }
    }

        /// <summary>
    /// Get comprehensive dashboard statistics
    /// </summary>
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var data = await _analyticsService.GetDashboardStatsAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard statistics" });
        }
    }
}