﻿﻿﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Index("Email", Name = "users_Email_key", IsUnique = true)]
[Index("UserName", Name = "users_UserName_key", IsUnique = true)]
public partial class User : IdentityUser
{

    [MaxLength(100)]
    public string? Name { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime Created_On { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }

    public bool? IsDeleted { get; private set; }

    public string? ProfilePicture { get; private set; }

    public string? Address { get; private set; }

    public int LoyaltyPoints { get; private set; }

    [InverseProperty("user")]
    public virtual Cart cart { get; private set; } = null!;

    [InverseProperty("user")]
    public virtual ICollection<Order>? orders { get; private set; } = new List<Order>();

    [InverseProperty("user")]
    public virtual OrganizationOrganizer? organization_organizer { get; private set; }

    [InverseProperty("user")]
    public virtual ICollection<Redemption>? redemptions { get; private set; } = new List<Redemption>();

    [InverseProperty("user")]
    public virtual ICollection<Review>? reviews { get; private set; } = new List<Review>();

    private User() { }

    // Public constructor for Identity (required for UserManager to create users)
    public User(string userName, string email,string profilePicture,string address, bool emailconfirmed,string name) : base(userName)
    {
        Name = name;
        UserName = userName;
        EmailConfirmed = emailconfirmed;
        ProfilePicture = profilePicture;
        Email = email;
        Address = address;
    }

    public void UpdateProfile(string? Username, string? Name, string? profilepicture,string address)
    {
        if (Name != null)
            this.Name = Name;
        if (UserName != null)
            this.UserName = Username;
        this.UpdatedOn = DateTime.Now;
        if (profilepicture != null)
            this.ProfilePicture = profilepicture;
        if(address != null)
            this.Address = address;
    }
    public void AddLoyaltyPoints(int points)
    {
        if (points > 0)
            LoyaltyPoints += points;
    }
    public void DeductLoyaltyPoints(int points)
    {
        if (points > 0 )
            LoyaltyPoints = int.Max(LoyaltyPoints - points,0);
    }
    public void BanUser()
    {
        IsDeleted = true;
        UpdatedOn = DateTime.Now;
    }
    public void set_loyalty_points(int points)
    {
        LoyaltyPoints = points;
    }
}