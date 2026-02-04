﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("Products")]
public partial class Product
{
    [Key]
    public int Id { get; private set; }

    public int? ShopId { get; private set; }

    public int? StoreId { get; private set; }

    [Required,MaxLength(255)]
    public string Name { get; private set; } = null!;

    public string? Description { get; private set; }

    [Precision(10, 2)]
    public decimal? Price { get; private set; }

    public int StockQuantity { get; private set; }

    public int QuantitySold { get; private set; }

    public int LimitPerUser { get; private set; }

    [Precision(10, 2)]
    public decimal Discount { get; private set; }

    public int? PointsEarnedPerUnit { get; private set; }

    public string? ProductImage { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedOn { get; private set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedOn { get; private set; }
    public bool IsDeleted { get; private set; }

    public virtual ICollection<CartItem> cartitems { get; private set; } = new List<CartItem>();

    public virtual ICollection<Order> orders { get; private set; } = new List<Order>();

    [InverseProperty("product")]
    public virtual ICollection<Review> reviews { get; private set; } = new List<Review>();

    [InverseProperty("item_product")]
    public virtual ICollection<Reward> rewards { get; private set; } = new List<Reward>();

    [ForeignKey("ShopId")]
    [InverseProperty("products")]
    public virtual Shop? shop { get; private set; }

    [ForeignKey("StoreId")]
    [InverseProperty("products")]
    public virtual Store? store { get; private set; }

    private Product() { }

    public Product(string name, int stockQuantity, int? shopId = null, int? storeId = null,
        string? description = null, decimal? price = null, int limitPerUser = 1,
        decimal discount = 0, int pointsEarnedPerUnit = 0, string? productImage = null)
    {
        ShopId = shopId;
        StoreId = storeId;
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        LimitPerUser = limitPerUser;
        Discount = discount;
        PointsEarnedPerUnit = pointsEarnedPerUnit;
        ProductImage = productImage;
       
    }
    
    public void Update(string? name = null, string? description = null, decimal? price = null,
        int? stockQuantity = null, int? limitPerUser = null, decimal? discount = null,
        int? pointsEarnedPerUnit = null, string? productImage = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        
        if (description != null)
            Description = description;
        
        if (price.HasValue)
            Price = price;
        
        if (stockQuantity.HasValue)
            StockQuantity = stockQuantity.Value;
        
        if (limitPerUser.HasValue)
            LimitPerUser = limitPerUser.Value;
        
        if (discount.HasValue)
            Discount = discount.Value;
        
        if (pointsEarnedPerUnit.HasValue)
            PointsEarnedPerUnit = pointsEarnedPerUnit;
        
        if (productImage != null)
            ProductImage = productImage;
        
        UpdatedOn = DateTime.Now;
    }
    public void UpdateQuantity(int quantityAvailable, int quantitySold)
    {
        StockQuantity = quantityAvailable;
        QuantitySold = quantitySold;
    }

    public void MarkAsDeleted()
    {
        IsDeleted = true;
        UpdatedOn = DateTime.Now;
    }

}
