using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bookify_Backend.Entities;

[Table("payments")]
public partial class Payment
{
    [Key]
    public int id { get; private set; }

    public int order_id { get; private set; }

    [MaxLength(50)]
    public string payment_method { get; private set; } = null!;
    
    // card masked number, phone number, Instapay email/number
    [MaxLength(100)]
    public string payment_reference { get; private set; } = null!;

    [MaxLength(20)]
    public string status { get; private set; } = "Pending";

    public DateTime payment_date { get; private set; }

    [ForeignKey(nameof(order_id))]
    [InverseProperty(nameof(Order.payment))]
    public Order order { get; private set; } = null!;

    private Payment() { }

    public Payment(int orderId, string method , string payment_reference)
    {
        order_id = orderId;
        payment_method = method;
        this.payment_reference = payment_reference;
    }
    public void update_status(string newStatus)
    {
        status = newStatus;
    }
    public void update_reference(string reference)
    {
        payment_reference = reference;
    }

    public void update_method(string method)
    {
        payment_method = method;
    }
}