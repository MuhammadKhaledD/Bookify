using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bookify_Backend.Entities;

[Table("carts")]
public partial class Cart
{
    [Key]
    public int id { get; private set; }

    public string user_id { get; private set; } = null!;

    public DateTime created_on { get; private set; }
    public DateTime? updated_on { get; private set; }

    [InverseProperty(nameof(CartItem.cart))]
    public ICollection<CartItem> cart_items { get; private set; } = new List<CartItem>();

    [ForeignKey(nameof(user_id))]
    [InverseProperty(nameof(User.cart))]
    public User user { get; private set; } = null!;

    private Cart() { }

    public Cart(string userId)
    {
        user_id = userId;
    }

    public void touch()
    {
        updated_on = DateTime.Now;
    }
}