namespace Bookify_Backend.DTOs;

// For GET /api/events - minimal card view
public record EventSummaryDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public DateTime EventDate { get; init; }
    public string? LocationName { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
    public decimal? MinPrice { get; init; }
    public string? Status { get; init; }
}

// For GET /api/events/{id} - full details
public record EventDetailsDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public DateTime EventDate { get; init; }
    public string? LocationName { get; init; }
    public string LocationAddress { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public int OrganizationId { get; init; }
    public string OrganizationName { get; init; } = string.Empty;
    public string? Status { get; init; }
    public int Capacity { get; init; }
    public int? AgeRestriction { get; init; }
    public decimal? MinPrice { get; init; }
    public DateTime AddedOn { get; init; }
    public DateTime? UpdatedOn { get; init; }
}
