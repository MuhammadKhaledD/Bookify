﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Shops")]
public partial class Shop
{
    [Key]
    public int Id { get; private set; }

    public int? EventId { get; private set; }

    [Required,MaxLength(255)]
    public string Name { get; private set; }

    public string? Description { get; private set; }

    public bool Status { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get; private set; }

    public string? ShopLogo { get; private set; }

    [ForeignKey("EventId")]
    [InverseProperty("shop")]
    public virtual Event? _event { get; private set; }

    [InverseProperty("shop")]
    public virtual ICollection<Product> products { get; private set; } = new List<Product>();

    private Shop() { }

    public Shop(int? eventId, string name, string? description = null,
        bool status = true, string? shopLogo = null)
    {
        EventId = eventId;
        Name = name;
        Description = description;
        Status = status;
        ShopLogo = shopLogo;
    }
    
    public void Update(string? name = null, string? description = null, bool? status = null, string? shopLogo = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        
        if (description != null)
            Description = description;
        
        if (status.HasValue)
            Status = status.Value;
        
        if (shopLogo != null)
            ShopLogo = shopLogo;
    }
}
