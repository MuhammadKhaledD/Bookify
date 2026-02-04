using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class PaymentService
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITicketRepository _ticketRepo;
    private readonly IProductRepository _productRepo;
    private readonly IRedemptionRepository _redemptionRepo;

    public PaymentService(
        IPaymentRepository paymentRepo,
        IOrderRepository orderRepo,
        IUnitOfWork unitOfWork,
        ITicketRepository ticketRepo,
        IProductRepository productRepo,
        IRedemptionRepository redemptionRepo)
    {
        _paymentRepo = paymentRepo;
        _orderRepo = orderRepo;
        _unitOfWork = unitOfWork;
        _ticketRepo = ticketRepo;
        _productRepo = productRepo;
        _redemptionRepo = redemptionRepo;
    }

    // --------------------
    // Create payment
    // --------------------
    public async Task<Payment> CreateAsync(int orderId, string method, string payment_reference)
    {
        var order = await _orderRepo.GetByIdWithDetailsAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Order not found.");

        if (order.status == "Delivered" || order.status == "UnderReview")
            throw new InvalidOperationException("Invalid order state.");

        var payment = new Payment(orderId, method, payment_reference);
        await _paymentRepo.AddAsync(payment);

        order.update_status("UnderReview");
        await _orderRepo.UpdateAsync(order);

        await _unitOfWork.SaveChangesAsync();
        return payment;
    }

    // --------------------
    // Update payment (user)
    // --------------------
    public async Task UpdateAsync(int paymentId, string? method, string? payment_reference)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId);
        if (payment == null || payment.order == null)
            throw new InvalidOperationException("Payment not found.");

        if (payment.order.status == "Delivered")
            throw new InvalidOperationException("Payment cannot be edited.");

        if (method != null)
            payment.update_method(method);

        if (payment_reference != null)
            payment.update_reference(payment_reference);

        payment.update_status("Pending");
        payment.order.update_status("UnderReview");

        await _paymentRepo.UpdateAsync(payment);
        await _orderRepo.UpdateAsync(payment.order);
        await _unitOfWork.SaveChangesAsync();
    }

    // --------------------
    // Delete payment
    // --------------------
    public async Task DeleteAsync(int paymentId)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId);
        if (payment == null || payment.order == null)
            throw new InvalidOperationException("Payment not found.");

        if (payment.order.status == "Delivered")
            throw new InvalidOperationException("Payment cannot be deleted.");

        // break logical dependency first
        payment.order.update_status("Unpaid");
        await _orderRepo.UpdateAsync(payment.order);
        await _unitOfWork.SaveChangesAsync();

        await _paymentRepo.DeleteAsync(payment);
        await _unitOfWork.SaveChangesAsync();
    }

// --------------------
// Admin update payment state
// --------------------
public async Task AdminUpdateStateAsync(int paymentId, string status)
{
    try
    {
        if (string.IsNullOrWhiteSpace(status))
            throw new InvalidOperationException("Status is required.");

        status = status.Trim();

        var payment = await _paymentRepo.GetByIdAsync(paymentId);
        if (payment == null)
            throw new InvalidOperationException("Payment not found.");

        if (payment.order == null)
            throw new InvalidOperationException("Payment has no associated order.");

        var order = payment.order;

        if (order.user == null)
            throw new InvalidOperationException("Order has no associated user.");

        if (order.items == null || !order.items.Any())
            throw new InvalidOperationException("Order has no items.");

        if (status == "Valid")
        {
            payment.update_status("Valid");
            order.update_status("Delivered");

            // loyalty points
            var points = (int)(order.total_amount * 0.10m);
            order.user.set_loyalty_points(order.user.LoyaltyPoints + points);
            
            // inventory update
            foreach (var item in order.items)
            {
                if (string.IsNullOrWhiteSpace(item.item_type))
                    throw new InvalidOperationException("Order item type is missing.");

// --------------------
// Finalize redemption for this item (if exists)
// --------------------
                Redemption? pendingRedemption = null;

                if (item.item_type.Trim().Equals("product", StringComparison.OrdinalIgnoreCase))
                {
                    var redemptions = await _redemptionRepo
                        .GetRedemptionsByProductIdAsync(item.item_id);

                    pendingRedemption = redemptions.FirstOrDefault(r =>
                        r.UserId == order.user.Id &&
                        r.Status == "Unused");
                }
                else if (item.item_type.Trim().Equals("ticket", StringComparison.OrdinalIgnoreCase))
                {
                    var redemptions = await _redemptionRepo
                        .GetRedemptionsByTicketIdAsync(item.item_id);

                    pendingRedemption = redemptions.FirstOrDefault(r =>
                        r.UserId == order.user.Id &&
                        r.Status == "Unused");
                }

                if (pendingRedemption != null)
                {
                    pendingRedemption.UpdateStatus("Used");
                    await _redemptionRepo.UpdateAsync(pendingRedemption);
                }


                
                switch (item.item_type.Trim().ToLower())
                {
                    case "ticket":
                    {
                        var ticket = await _ticketRepo.GetByIdAsync(item.item_id);
                        if (ticket == null)
                            throw new InvalidOperationException($"Ticket {item.item_id} not found.");

                        if (ticket.QuantityAvailable < item.quantity)
                            throw new InvalidOperationException("Ticket inventory insufficient.");

                        ticket.UpdateQuantity(
                            ticket.QuantityAvailable - item.quantity,
                            ticket.QuantitySold + item.quantity
                        );

                        await _ticketRepo.UpdateAsync(ticket);
                        break;
                    }

                    case "product":
                    {
                        var product = await _productRepo.GetByIdAsync(item.item_id);
                        if (product == null)
                            throw new InvalidOperationException($"Product {item.item_id} not found.");

                        if (product.StockQuantity < item.quantity)
                            throw new InvalidOperationException("Product inventory insufficient.");

                        product.UpdateQuantity(
                            product.StockQuantity - item.quantity,
                            product.QuantitySold + item.quantity
                        );

                        await _productRepo.UpdateAsync(product);
                        break;
                    }

                    default:
                        throw new InvalidOperationException($"Unknown item type: {item.item_type}");
                }
            }
            
        }
        else if (status == "Declined")
        {
            payment.update_status("Declined");
            order.update_status("Unpaid");
        }
        else
        {
            throw new InvalidOperationException("Invalid status.");
        }

        await _paymentRepo.UpdateAsync(payment);
        await _orderRepo.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();
    }
    catch (InvalidOperationException)
    {
        // business / validation errors → let controller return 400
        throw;
    }
    catch (Exception ex)
    {
        // unexpected errors → visible in Azure logs
        throw new Exception($"Failed to update payment {paymentId}.", ex);
    }
}

    public async Task<object?> GetAllAsync()
    {
        return await _paymentRepo.GetAllAsync();
    }
}
