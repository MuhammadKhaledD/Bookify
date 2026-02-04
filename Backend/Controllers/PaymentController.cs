using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookify_Backend.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly PaymentService _paymentService;

    public PaymentsController(PaymentService paymentService)
    {
        _paymentService = paymentService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _paymentService.GetAllAsync());
    
    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentRequest request)
        => Ok(await _paymentService.CreateAsync(request.order_id, request.method, request.payment_reference));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdatePaymentRequest request)
    {
        await _paymentService.UpdateAsync(id, request.method , request.payment_reference);
        return Ok();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _paymentService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPut("admin/{id:int}")]
    public async Task<IActionResult> AdminUpdate(int id, AdminPaymentRequest request)
    {
        await _paymentService.AdminUpdateStateAsync(id, request.status);
        return Ok();
    }
}

public record CreatePaymentRequest(int order_id, string method, string payment_reference);
public record UpdatePaymentRequest(string? method = null , string? payment_reference = null);
public record AdminPaymentRequest(string status);