using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Entities;

[Table("cart_items")]
public partial class CartItem
{
    [Key]
    public int id { get; private set; }

    public int item_id { get; private set; }

    [MaxLength(20)]
    public string item_type { get; private set; } = null!;

    public int quantity { get; private set; }

    [Precision(10, 2)]
    public decimal unit_price { get; private set; }

    public int? cart_id { get; private set; }
    public int? order_id { get; private set; }

    public DateTime added_on { get; private set; }
    public bool is_deleted { get; private set; }

    [ForeignKey(nameof(cart_id))]
    [InverseProperty(nameof(Cart.cart_items))]
    public Cart? cart { get; private set; }

    [ForeignKey(nameof(order_id))]
    [InverseProperty(nameof(Order.items))]
    public Order? order { get; private set; }

    private CartItem() { }

    public CartItem(int itemId, string itemType, int quantity, decimal unitPrice, int cartId)
    {
        item_id = itemId;
        item_type = itemType;
        this.quantity = quantity;
        unit_price = unitPrice;
        cart_id = cartId;
    }

    public void move_to_order(int orderId)
    {
        cart_id = null;
        order_id = orderId;
    }

    public void mark_as_deleted()
    {
        is_deleted = true;
    }
    public void update_quantity(int newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        quantity = newQuantity;
    }
}