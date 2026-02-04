namespace Bookify_Backend.DTOs;

// Single DTO for all ticket CRUD operations
public record TicketDto
{
    public int Id { get; init; }
    public int EventId { get; init; }
    public string TicketType { get; init; } = string.Empty;
    public decimal? Price { get; init; }
    public int QuantityAvailable { get; init; }
    public int QuantitySold { get; init; }
    public int LimitPerUser { get; init; }
    public decimal? Discount { get; init; }
    public bool? IsRefundable { get; init; }
    public int PointsEarnedPerUnit { get; init; }
    public string? SeatsDescription { get; init; }
    public DateTime CreatedOn { get; init; }
}

// For creating a new ticket
public record CreateTicketRequest
{
    public int EventId { get; init; }
    public string TicketType { get; init; } = string.Empty;
    public decimal? Price { get; init; }
    public int QuantityAvailable { get; init; }
    public int LimitPerUser { get; init; } = 1;
    public decimal? Discount { get; init; }
    public bool? IsRefundable { get; init; } = false;
    public int PointsEarnedPerUnit { get; init; } = 0;
    public string? SeatsDescription { get; init; }
}

// For updating a ticket
public record UpdateTicketRequest
{
    public string? TicketType { get; init; }
    public decimal? Price { get; init; }
    public int? QuantityAvailable { get; init; }
    public int? LimitPerUser { get; init; }
    public decimal? Discount { get; init; }
    public bool? IsRefundable { get; init; }
    public int? PointsEarnedPerUnit { get; init; }
    public string? SeatsDescription { get; init; }
}
