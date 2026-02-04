﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Categories")]
public partial class Category
{
    [Key]
    public int Id { get;private set; }

    [Required,MaxLength(100)]
    public string Name { get;private set; } = null!;

    public string? Description { get;private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get;private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }
    public bool IsDeleted { get; private set; }


    [InverseProperty("category")]
    public virtual ICollection<Event> events { get; private set; } = new List<Event>();

    private Category() 
    {
        Name = string.Empty; // EF Core parameterless constructor
    }

    public Category(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }
    public void Update(string? name, string? description)
    {
        if(name != null)
            Name = name;
        if(description != null)
            this.Description = description;
        UpdatedOn = DateTime.Now;
    }

    public void DeleteCategory()
    {
        IsDeleted = true;
        UpdatedOn = DateTime.Now;
    }
}
