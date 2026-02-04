﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("organizations")]
public partial class Organization
{
    [Key]
    public int Id { get; private set; }

    [Required,MaxLength(255)]

    public string Name { get; private set; }

    public string? Description { get; private set; }

    [MaxLength(255)]
    public string? ContactEmail { get; private set; }

    [MaxLength(20)]
    public string? ContactPhone { get; private set; }

    public string? Address { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime AddedOn { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }

    public bool IsDeleted { get; private set; }

    [InverseProperty("org")]
    public virtual ICollection<Event> events { get; private set; } = new List<Event>();

    [InverseProperty("org")]
    public virtual ICollection<OrganizationOrganizer> organization_organizers { get; private set; } = new List<OrganizationOrganizer>();

    [InverseProperty("org")]
    public virtual Store? store { get; private set; }

    private Organization() 
    {
        Name = string.Empty; // EF Core parameterless constructor
    }

    public Organization(string name, string? description = null, string? contactEmail = null,
        string? contactPhone = null, string? address = null)
    {
        Name = name;
        Description = description;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        Address = address;
    }
    
    public void Update(string? name = null, string? description = null, string? contactEmail = null,
        string? contactPhone = null, string? address = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        
        if (description != null)
            Description = description;
        
        if (contactEmail != null)
            ContactEmail = contactEmail;
        
        if (contactPhone != null)
            ContactPhone = contactPhone;
        
        if (address != null)
            Address = address;
        
        UpdatedOn = DateTime.Now;
    }
    
    public void MarkAsDeleted()
    {
        IsDeleted = true;
        UpdatedOn = DateTime.Now;
    }
}
