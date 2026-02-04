﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Redemptions")]
public partial class Redemption
{
    [Key]
    public int Id { get; private set; }

    public int PointsSpent { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime RedeemedAt { get; private set; }

    public string UserId { get; private set; }

    public int RewardId { get; private set; }

    [MaxLength(50)]
    public string? Status { get; private set; }

    [ForeignKey("RewardId")]
    [InverseProperty("redemptions")]
    public virtual Reward reward { get; private set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("redemptions")]
    public virtual User user { get; private set; } = null!;

    private Redemption() { }

    public Redemption(string userId, int rewardId, int pointsSpent, string? status = "Pending")
    {
        UserId = userId;
        RewardId = rewardId;
        PointsSpent = pointsSpent;
        RedeemedAt = DateTime.Now;
        Status = status;
    }

    public void UpdateStatus(string used)
    {
        Status  = used;
    }
}
