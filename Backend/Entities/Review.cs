﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Reviews")]
public partial class Review
{
    [Key]
    public int Id { get; private set; }

    public string UserId { get; private set; }

    public int? EventId { get; private set; }

    public int? ProductId { get; private set; }

    [MaxLength(20)]
    public string? ReviewType { get; private set; }

    [Required]
    [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
    public float Rating { get; private set; }

    public string? Comment { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }

    public bool IsDeleted { get; private set; }

    [ForeignKey("EventId")]
    [InverseProperty("reviews")]
    public virtual Event? _event { get; private set; }

    [ForeignKey("ProductId")]
    [InverseProperty("reviews")]
    public virtual Product? product { get; private set; }

    [ForeignKey("UserId")]
    [InverseProperty("reviews")]
    public virtual User? user { get; private set; }

    private Review() { }

    public Review(string userId, float rating, string? comment = null,
        int? eventId = null, int? productId = null, string? reviewType = null)
    {
        UserId = userId;
        EventId = eventId;
        ProductId = productId;
        ReviewType = reviewType;
        Rating = rating;
        Comment = comment;
        CreatedOn = DateTime.Now;
    }
    public void UpdateReview(float rating = 0, string? comment = null)
    {

        if(rating != 0)
            Rating = rating;
        if(comment != null)
            Comment = comment;
        UpdatedOn = DateTime.Now;
    }
    public void MarkAsDeleted()
    {
        IsDeleted = true;
        UpdatedOn = DateTime.Now;
    }
}
