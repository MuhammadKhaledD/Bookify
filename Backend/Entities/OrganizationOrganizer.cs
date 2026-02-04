﻿﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[PrimaryKey("UserId", "OrgId")]
public partial class OrganizationOrganizer
{
    [Key]
    public string UserId { get; private set; }

    [Key]
    public int OrgId { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime AssignedOn { get; private set; }
    public bool IsDeleted { get; private set; }


    [ForeignKey("OrgId")]
    [InverseProperty("organization_organizers")]
    public virtual Organization org { get; private set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("organization_organizer")]
    public virtual User user { get; private set; } = null!;
    private OrganizationOrganizer() { }

    public OrganizationOrganizer(string userId, int orgId)
    {
        UserId = userId;
        OrgId = orgId;
        AssignedOn = DateTime.Now;
        IsDeleted = false;
    }
}
