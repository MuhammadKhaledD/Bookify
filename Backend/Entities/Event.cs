﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Events")]
public partial class Event
{
    [Key]
    public int Id { get;private set; }

    public int OrgId { get;private set; }

    public int CategoryId { get; private set; }

    [Required, MaxLength(255)]
    public string Title { get; private set; }

    [Required]
    public string Description { get; private set; }

    [MaxLength(255)]
    public string? LocationName { get; private set; }

    [Required]
    public string LocationAddress { get; private set; }

    [Required]
    public DateTime EventDate { get; private set; }


    public string? Image_Url { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime AddedOn { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }

    [Required]
    public int Capacity { get; private set; }

    public int? Age_Restriction { get; private set; }

    [MaxLength(50)]
    public string? Status { get; private set; }
    public bool IsDeleted { get; private set; }


    [ForeignKey("CategoryId")]
    [InverseProperty("events")]
    public virtual Category category { get; private set; } = null!;

    [ForeignKey("OrgId")]
    [InverseProperty("events")]
    public virtual Organization org { get; private set; } = null!;

    [InverseProperty("_event")]
    public virtual ICollection<Review>? reviews { get; private set; } = new List<Review>();

    [InverseProperty("_event")]
    public virtual Shop?  shop { get; private set; }

    [InverseProperty("_event")]
    public virtual ICollection<Ticket> tickets { get; private set; } = new List<Ticket>();

    private Event() { }

    public Event(int orgId, int categoryId, string title, string description,
        string locationAddress, DateTime eventDate, int capacity,
        string? locationName = null, int? ageRestriction = null, string? imageUrl = null)
    {
        OrgId = orgId;
        CategoryId = categoryId;
        Title = title;
        Description = description;
        LocationAddress = locationAddress;
        EventDate = eventDate;
        Capacity = capacity;
        LocationName = locationName;
        Age_Restriction = ageRestriction;
        Image_Url = imageUrl;
        Status = "Active";
    }
    public void MarkAsDeleted()
    {
        IsDeleted = true;
        Status = "InActive";
        UpdatedOn = DateTime.Now;
    }

    public void Update(string? title = null, string? description = null, 
        string? locationName = null, string? locationAddress = null, 
        DateTime? eventDate = null, int? capacity = null, 
        int? ageRestriction = null, string? imageUrl = null)
    {
        if (!string.IsNullOrWhiteSpace(title))
            Title = title;
        
        if (!string.IsNullOrWhiteSpace(description))
            Description = description;
        
        if (locationName != null)
            LocationName = locationName;
        
        if (!string.IsNullOrWhiteSpace(locationAddress))
            LocationAddress = locationAddress;
        
        if (eventDate.HasValue)
            EventDate = eventDate.Value;
        
        if (capacity.HasValue && capacity.Value > 0)
            Capacity = capacity.Value;
        
        if (ageRestriction.HasValue && ageRestriction.Value > 0)
            Age_Restriction = ageRestriction;
        
        if (imageUrl != null)
            Image_Url = imageUrl;
        
        UpdatedOn = DateTime.Now;
    }

    public void UpdateStatus(string status)
    {
        if (!string.IsNullOrWhiteSpace(status))
        {
            Status = status;
            UpdatedOn = DateTime.Now;
        }
    }
}
