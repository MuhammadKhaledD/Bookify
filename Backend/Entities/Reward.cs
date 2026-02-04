﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Rewards")]
public partial class Reward
{
    [Key]
    public int Id { get; private set; }

    [MaxLength(255)]
    public string? Name { get; private set; }

    public string? Description { get; private set; }

    public int PointsRequired { get; private set; }

    [MaxLength(20)]
    public string? RewardType { get; private set; }

    public int? Discount { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExpireDate { get; private set; }

    public bool Status { get; private set; }

    public int? ItemProductId { get; private set; }

    public int? ItemTicketId { get; private set; }
    public bool IsDeleted { get; private set; }


    [ForeignKey("ItemProductId")]
    [InverseProperty("rewards")]
    public virtual Product? item_product { get; private set; }

    [ForeignKey("ItemTicketId")]
    [InverseProperty("rewards")]
    public virtual Ticket? item_ticket { get; private set; }

    [InverseProperty("reward")]
    public virtual ICollection<Redemption> redemptions { get; private set; } = new List<Redemption>();
    private Reward() { }

    public Reward(int pointsRequired, string? name = null, string? description = null,
        string? rewardType = null, int? discount = null, DateTime? expireDate = null,
        bool status = true, int? itemProductId = null, int? itemTicketId = null)
    {
        Name = name;
        Description = description;
        PointsRequired = pointsRequired;
        RewardType = rewardType;
        Discount = discount;
        ExpireDate = expireDate;
        Status = status;
        ItemProductId = itemProductId;
        ItemTicketId = itemTicketId;
    }
    /// <summary>
    /// Update reward properties
    /// </summary>
    public void UpdateReward(
        int? pointsRequired = null,
        string? name = null,
        string? description = null,
        string? rewardType = null,
        int? discount = null,
        DateTime? expireDate = null,
        bool? status = null,
        int? itemProductId = null,
        int? itemTicketId = null)
    {
        if (pointsRequired.HasValue)
            PointsRequired = pointsRequired.Value;

        if (!string.IsNullOrWhiteSpace(name))
            Name = name;

        if (description != null)
            Description = description;

        if (!string.IsNullOrWhiteSpace(rewardType))
            RewardType = rewardType;

        if (discount.HasValue)
            Discount = discount;

        if (expireDate.HasValue)
            ExpireDate = DateTime.SpecifyKind(expireDate.Value, DateTimeKind.Unspecified);

        if (status.HasValue)
            Status = status.Value;

        if (itemProductId.HasValue)
            ItemProductId = itemProductId;

        if (itemTicketId.HasValue)
            ItemTicketId = itemTicketId;
    }

    /// <summary>
    /// Mark reward as deleted (soft delete)
    /// </summary>
    public void MarkAsDeleted()
    {
        IsDeleted = true;
    }
}
