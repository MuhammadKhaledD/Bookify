﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Stores")]
public partial class Store
{
    [Key]
    public int Id { get; private set; }

    public int? OrgId { get; private set; }

    [Required,MaxLength(255)]
    public string? Name { get; private set; }

    public string? Description { get; private set; }

    public bool Status { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get; private set; }

    public string? StoreLogo { get; private set; }

    [ForeignKey("OrgId")]
    [InverseProperty("store")]
    public virtual Organization org { get; private set; }

    [InverseProperty("store")]
    public virtual ICollection<Product> products { get; private set; } = new List<Product>();

    private Store() { }

    public Store(int? orgId, string name, string? description = null,
        bool status = true, string? storeLogo = null)
    {
        OrgId = orgId;
        Name = name;
        Description = description;
        Status = status;
        StoreLogo = storeLogo;
    }
    
    public void Update(string? name = null, string? description = null, bool? status = null, string? storeLogo = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        
        if (description != null)
            Description = description;
        
        if (status.HasValue)
            Status = status.Value;
        
        if (storeLogo != null)
            StoreLogo = storeLogo;
    }
}
