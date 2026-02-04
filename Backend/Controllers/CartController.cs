using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Bookify_Backend.Helpers;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly CartService _cartService;
    private readonly AuthHelper _authHelper;

    public CartController(CartService cartService, AuthHelper authHelper)
    {
        _cartService = cartService;
        _authHelper = authHelper;
    }

    // --------------------
    // GET /api/cart
    // --------------------
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var token = GetAccessTokenFromHeader();
        if (token == null)
            return Unauthorized(new { message = "Access token missing or invalid." });

        var cart = await _cartService.GetUserCartAsync(token);
        if (cart == null)
            return Unauthorized(new { message = "Access token is invalid or expired." });

        return Ok(new
        {
            cart_id = cart.id,
            items = cart.cart_items
                        .Where(i => !i.is_deleted)
                        .Select(i => new
                        {
                            cart_item_id = i.id,
                            i.item_id,
                            i.item_type,
                            i.quantity,
                            i.unit_price,
                            total = i.quantity * i.unit_price
                        }),
            subtotal = cart.cart_items
                           .Where(i => !i.is_deleted)
                           .Sum(i => i.quantity * i.unit_price)
        });
    }

    // --------------------
    // POST /api/cart/items
    // --------------------
// POST /api/cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is missing" });

        var token = GetAccessTokenFromHeader();
        if (token == null)
            return Unauthorized(new { message = "Access token missing or invalid." });

        var userId = _authHelper.GetUserIdFromToken(token);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User ID could not be extracted from token." });

        try
        {
            var item = await _cartService.AddItemAsync(userId, request.item_id, request.item_type, request.quantity, request.unit_price);

            return Ok(new
            {
                cart_item_id = item.id,
                item.item_id,
                item.item_type,
                item.quantity,
                item.unit_price
            });
        }
        catch (Exception ex)
        {
            // Return the exact error for debugging
            return BadRequest(new { message = ex.Message });
        }
    }

// --------------------
// PUT /api/cart/items/{cartItemId}
// --------------------
    [HttpPut("items/{cartItemId:int}")]
    public async Task<IActionResult> UpdateItemQuantity(
        int cartItemId,
        UpdateQuantityRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is missing." });

        var token = GetAccessTokenFromHeader();
        if (token == null)
            return Unauthorized(new { message = "Access token missing or invalid." });

        var userId = _authHelper.GetUserIdFromToken(token);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            var item = await _cartService.UpdateItemQuantityAsync(
                userId,
                cartItemId,
                request.quantity);

            return Ok(new
            {
                cart_item_id = item.id,
                item.item_id,
                item.item_type,
                item.quantity,
                item.unit_price,
                total = item.quantity * item.unit_price
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    
    
    
// --------------------
// DELETE /api/cart/items/{cartItemId}
// --------------------
    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> DeleteItem(int cartItemId)
    {
        var token = GetAccessTokenFromHeader();
        if (token == null)
            return Unauthorized(new { message = "Access token missing or invalid." });

        var userId = _authHelper.GetUserIdFromToken(token);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            await _cartService.DeleteItemAsync(userId, cartItemId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // --------------------
    // Helper to get access token from header
    // --------------------
    private string? GetAccessTokenFromHeader()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return null;

        return authHeader.Substring("Bearer ".Length).Trim();
    }
}

// --------------------
// Request DTOs
// --------------------
public record AddCartItemRequest(int item_id, string item_type, int quantity, decimal unit_price);
public record UpdateQuantityRequest(int quantity);
