using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Bookify_Backend.Helpers;

namespace Bookify_Backend.Services;

public class CartService
{
    private readonly ICartRepository _cartRepo;
    private readonly ICartItemRepository _cartItemRepo;
    private readonly AuthHelper _authHelper;
    private readonly IUnitOfWork _unitOfWork;

    public CartService(
        ICartRepository cartRepo,
        ICartItemRepository cartItemRepo,
        AuthHelper authHelper,
        IUnitOfWork unitOfWork)
    {
        _cartRepo = cartRepo;
        _cartItemRepo = cartItemRepo;
        _authHelper = authHelper;
        _unitOfWork = unitOfWork;
    }

    // --------------------
    // Get the user's cart by token
    // --------------------
    public async Task<Cart?> GetUserCartAsync(string token)
    {
        if (!_authHelper.ValidateAccessToken(token))
            return null;

        var userId = _authHelper.GetUserIdFromToken(token);
        if (string.IsNullOrEmpty(userId))
            return null;

        return await _cartRepo.GetCartByUserIdAsync(userId);
    }

    // --------------------
    // Add a new item or increment quantity if exists
    public async Task<CartItem> AddItemAsync(string userId, int itemId, string itemType, int quantity, decimal unitPrice)
    {
        var cart = await _cartRepo.GetCartByUserIdAsync(userId);

        // ✅ REQUIRED guard
        if (cart == null)
        {
            //  Create cart for user
            await _cartRepo.AddAsync(new Cart(userId));
            await _unitOfWork.SaveChangesAsync();
            throw new InvalidOperationException(
                "User cart not found. This should not happen, please try again");
        }

        var existing = await _cartItemRepo
            .GetByCartAndItemAsync(cart.id, itemId, itemType);

        if (existing != null)
        {
            existing.update_quantity(existing.quantity + quantity);
            await _cartItemRepo.UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();
            return existing;
        }

        var item = new CartItem(itemId, itemType, quantity, unitPrice, cart.id);
        await _cartItemRepo.AddAsync(item);
        await _unitOfWork.SaveChangesAsync();

        return item;
    }

    // --------------------
    // Update quantity
    // --------------------
// --------------------
// Update item quantity
// --------------------
    public async Task<CartItem> UpdateItemQuantityAsync(
        string userId,
        int cartItemId,
        int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var cart = await _cartRepo.GetCartByUserIdAsync(userId);
        if (cart == null)
            throw new InvalidOperationException("User cart not found.");

        var item = await _cartItemRepo.GetByIdAsync(cartItemId);
        if (item == null || item.is_deleted)
            throw new InvalidOperationException("Cart item not found.");

        // 🔐 Ownership check
        if (item.cart_id != cart.id)
            throw new UnauthorizedAccessException("Item does not belong to user cart.");

        item.update_quantity(quantity);
        await _cartItemRepo.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();

        return item;
    }



    // --------------------
    // Delete cart item (soft delete)
    // --------------------
    public async Task DeleteItemAsync(string userId, int cartItemId)
    {
        var cart = await _cartRepo.GetCartByUserIdAsync(userId);
        if (cart == null)
            throw new InvalidOperationException("User cart not found.");

        var item = await _cartItemRepo.GetByIdAsync(cartItemId);
        if (item == null || item.is_deleted)
            throw new InvalidOperationException("Cart item not found.");

        // 🔐 Ownership check
        if (item.cart_id != cart.id)
            throw new UnauthorizedAccessException("Item does not belong to user cart.");

        await _cartItemRepo.DeleteAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }
}
