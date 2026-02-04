using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class OrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly ICartRepository _cartRepo;
    private readonly ICartItemRepository _cartItemRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentRepository _paymentRepo;
    private readonly IRedemptionRepository _redemptionRepo;

    public OrderService(
        IOrderRepository orderRepo,
        ICartRepository cartRepo,
        ICartItemRepository cartItemRepo,
        IUnitOfWork unitOfWork,
        IPaymentRepository paymentRepo,
        IRedemptionRepository redemptionRepo)
    {
        _orderRepo = orderRepo;
        _cartRepo = cartRepo;
        _cartItemRepo = cartItemRepo;
        _paymentRepo = paymentRepo;
        _unitOfWork = unitOfWork;
        _redemptionRepo = redemptionRepo;
    }

    // --------------------
    // Checkout
    // --------------------
    public async Task<Order> CheckoutAsync(string userId)
    {
        var cart = await _cartRepo.GetCartByUserIdAsync(userId);
        if (cart == null)
            throw new InvalidOperationException("Cart not found.");

        var items = cart.cart_items.Where(i => !i.is_deleted).ToList();
        if (!items.Any())
            throw new InvalidOperationException("Cart is empty.");

        // 1️⃣ Create + save order FIRST
        var order = new Order(userId);
        order.update_status("Unpaid");

        await _orderRepo.AddAsync(order);
        await _unitOfWork.SaveChangesAsync(); // 🔑 order.id now exists

        // 2️⃣ Now update cart items
        decimal total = 0;
        foreach (var item in items)
        {
            total += item.quantity * item.unit_price;
            item.move_to_order(order.id); // ✅ valid FK
            await _cartItemRepo.UpdateAsync(item);
        }
        // --------------------
        // Apply redemption discount (if exists)
        // --------------------
        var pendingRedemption = await _redemptionRepo
            .GetRedemptionsByUserIdAsync(userId);

        var redemption = pendingRedemption
            .FirstOrDefault(r => r.Status == "Pending");

        if (redemption != null)
        {
            // Example conversion: 1 point = 0.01
            decimal discount = redemption.PointsSpent * 0.01m;

            if (discount > total)
                discount = total;

            total -= discount;
        }


        // 3️⃣ Update order total
        order.set_total(total);
        await _unitOfWork.SaveChangesAsync();

        return order;
    }

    // --------------------
    // Get user orders
    // --------------------
    public async Task<IEnumerable<Order>> GetUserOrdersAsync(string userId)
        => await _orderRepo.GetOrdersByUserIdAsync(userId);

    // --------------------
    // Get order details
    // --------------------
    public async Task<Order> GetOrderAsync(int orderId, string userId)
    {
        var order = await _orderRepo.GetByIdWithDetailsAsync(orderId);
        if (order == null || order.user_id != userId)
            throw new InvalidOperationException("Order not found.");

        return order;
    }

    // --------------------
    // Delete order
    // --------------------
    public async Task DeleteOrderAsync(int orderId, string userId)
    {
        var order = await _orderRepo.GetByIdWithDetailsAsync(orderId);
        if (order == null || order.user_id != userId)
            throw new InvalidOperationException("Order not found.");

        if (order.status == "Delivered")
            throw new InvalidOperationException("Delivered orders cannot be deleted.");

        // 1️⃣ Delete payment first
        if (order.payment != null)
            await _paymentRepo.DeleteAsync(order.payment);

        // 2️⃣ Delete cart items FIRST
        foreach (var item in order.items)
            await _cartItemRepo.DeleteAsync(item);

        // 🔑 Force DB to delete child rows before parent
        await _unitOfWork.SaveChangesAsync();

        // 3️⃣ Now delete the order
        await _orderRepo.DeleteAsync(order);
        await _unitOfWork.SaveChangesAsync();
    }

}
