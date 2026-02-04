using Bookify_Backend.Models;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bookify_Backend.Controllers;

/// <summary>
/// Authentication Controller - Handles user registration, login, password management
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(AuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _configuration = configuration;
    }


    /// Register a new user
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromForm] RegisterRequest_ request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            var frontendUrl = _configuration["Frontend:Url"];
            var confirmationUrl = $"{frontendUrl}/confirm-email";

            var result = await _authService.RegisterAsync(request, Response, confirmationUrl);

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");

            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// Login user
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest_ request)
    {
        try
        {
            var result = await _authService.LoginAsync(request, Response);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Failed login attempt for {Email}", request.Email);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    /// Logout user
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _authService.LogoutAsync(userId, Response);
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new { message = "An error occurred during logout" });
        }
    }
    
    /// Refresh access token using refresh token from cookie

    [HttpGet("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(Request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Failed token refresh attempt");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new { message = "An error occurred while refreshing token" });
        }
    }

    /// Get current logged-in user information
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User ID not found in token" });

            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user");
            return StatusCode(500, new { message = "An error occurred while retrieving user information" });
        }
    }

    /// Change password for logged-in user
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            // Get userId from JWT token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var result = await _authService.ChangePasswordAsync(userId, request);

            return Ok(new
            {
                success = result.Success,
                message = result.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
    /// Request password reset email
    /// <summary>Request password reset email</summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid email address"
                });
            }

            // Frontend reset URL (where user will enter new password)
            var frontendUrl = _configuration["Frontend:Url"] ?? "https://bookify-ticket-shop-rewards.lovable.app";
            var resetUrl = $"{frontendUrl}/reset-password";
        
            var result = await _authService.ForgotPasswordAsync(request, resetUrl);

            return Ok(new
            {
                success = result.Success,
                message = result.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred. Please try again later."
            });
        }
    }
    /// Reset password using token from email
    /// <summary>Reset password using token from email</summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            var result = await _authService.ResetPasswordAsync(request);

            return Ok(new
            {
                success = result.Success,
                message = result.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
    /// Confirm email using token from email and auto-login user
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
    {
        try
        {
            var result = await _authService.ConfirmEmailAsync(request.Token, Response);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming email");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// Resend email confirmation link
    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationEmailRequest request)
    {
        try
        {
            // Build confirmation URL from frontend
            var frontendUrl = _configuration["FrontendUrl"] ?? "https://localhost:44349/api";
            var confirmationUrl = $"https://localhost:44349/api/auth/confirm-email";


            var (success, message) = await _authService.ResendConfirmationEmailAsync(request.Email, confirmationUrl);

            if (success)
                return Ok(new { message });
            else
                return BadRequest(new { message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resending confirmation email");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>Update authenticated user profile</summary>
    [HttpPut("editprofile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDTO request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            // Get userId from JWT token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var result = await _authService.UpdateProfileAsync(userId, request);

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}