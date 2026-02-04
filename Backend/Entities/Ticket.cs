using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Tickets")]
public partial class Ticket
{
    [Key]
    public int Id { get; private set; }

    [Required,MaxLength(50)]
    public string TicketType { get; private set; } = null!;

    public int EventId { get; private set; }

    [Precision(10, 2)]
    public decimal? Price { get; private set; }

    public int QuantityAvailable { get; private set; }

    public int QuantitySold { get; private set; }

    public int LimitPerUser { get; private set; }

    [Precision(10, 2)]
    public decimal? Discount { get; private set; }

    public bool? IsRefundable { get; private set; }

    public int PointsEarnedPerUnit { get; private set; }

    public string? SeatsDescription { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get; private set; }
    public bool IsDeleted { get; private set; }


    [ForeignKey("EventId")]
    [InverseProperty("tickets")]
    public virtual Event _event { get; private set; } = null!;

    public virtual ICollection<CartItem> cartitems { get; private set; } = new List<CartItem>();

    public virtual ICollection<Order> orders { get; private set; } = new List<Order>();

    [InverseProperty("item_ticket")]
    public virtual ICollection<Reward> rewards { get; private set; } = new List<Reward>();

    private Ticket() { }

    public Ticket(int eventId, string ticketType, int quantityAvailable,
        decimal? price = null, int limitPerUser = 1, decimal? discount = null,
        bool isRefundable = false, int pointsEarnedPerUnit = 0, string? seatsDescription = null)
    {
        EventId = eventId;
        TicketType = ticketType;
        Price = price;
        QuantityAvailable = quantityAvailable;
        LimitPerUser = limitPerUser;
        Discount = discount;
        IsRefundable = isRefundable;
        PointsEarnedPerUnit = pointsEarnedPerUnit;
        SeatsDescription = seatsDescription;
    }

    public void Update(string? ticketType = null, int? quantityAvailable = null,
        decimal? price = null, int? limitPerUser = null, decimal? discount = null,
        bool? isRefundable = null, int? pointsEarnedPerUnit = null, string? seatsDescription = null)
    {
        if (!string.IsNullOrWhiteSpace(ticketType))
            TicketType = ticketType;
        
        if (quantityAvailable.HasValue && quantityAvailable.Value > 0)
            QuantityAvailable = quantityAvailable.Value;
        
        if (price.HasValue && price.Value > 0)
            Price = price.Value;
        
        if (limitPerUser.HasValue && limitPerUser.Value > 0)
            LimitPerUser = limitPerUser.Value;
        
        if (discount.HasValue && discount.Value > 0)
            Discount = discount.Value;
        
        if (isRefundable.HasValue)
            IsRefundable = isRefundable.Value;
        
        if (pointsEarnedPerUnit.HasValue && pointsEarnedPerUnit.Value > 0)
            PointsEarnedPerUnit = pointsEarnedPerUnit.Value;
        
        if (seatsDescription != null)
            SeatsDescription = seatsDescription;
    }

    public void UpdateQuantity(int quantityAvailable, int quantitySold)
    {
        QuantityAvailable = quantityAvailable;
        QuantitySold = quantitySold;
    }


    public void UpdatePrice(decimal price)
    {
        Price = price;
    }

    public void MarkAsDeleted()
    {
        IsDeleted = true;
    }

}
