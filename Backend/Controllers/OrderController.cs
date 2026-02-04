using Bookify_Backend.Services;
using Bookify_Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly AuthHelper _auth;

    public OrdersController(OrderService orderService, AuthHelper auth)
    {
        _orderService = orderService;
        _auth = auth;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = _auth.GetUserIdFromToken(GetToken());
        return Ok(await _orderService.CheckoutAsync(userId));
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var userId = _auth.GetUserIdFromToken(GetToken());
        return Ok(await _orderService.GetUserOrdersAsync(userId));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = _auth.GetUserIdFromToken(GetToken());
        return Ok(await _orderService.GetOrderAsync(id, userId));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var userId = _auth.GetUserIdFromToken(GetToken());
        await _orderService.DeleteOrderAsync(id, userId);
        return NoContent();
    }

    private string GetToken()
        => Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
}