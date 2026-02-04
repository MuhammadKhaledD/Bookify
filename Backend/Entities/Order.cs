using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("orders")]
public partial class Order
{
    [Key]
    public int id { get; private set; }

    public string user_id { get; private set; } = null!;

    public DateTime order_date { get; private set; }

    [MaxLength(50)]
    public string status { get; private set; } = "Pending";

    [Precision(10, 2)]
    public decimal total_amount { get; private set; }

    [InverseProperty(nameof(CartItem.order))]
    public ICollection<CartItem> items { get; private set; } = new List<CartItem>();

    [InverseProperty(nameof(Payment.order))]
    public Payment payment { get; private set; } = null!;

    [ForeignKey(nameof(user_id))]
    [InverseProperty(nameof(User.orders))]
    public User user { get; private set; } = null!;

    private Order() { }

    public Order(string userId)
    {
        user_id = userId;
        total_amount = 0;
    }

    public void set_total(decimal total)
    {
        total_amount = total;
    }

    public void update_status(string newStatus)
    {
        status = newStatus;
    }
}