using System.ComponentModel.DataAnnotations;

namespace Bookify_Backend.Models;

// Registration request
public class RegisterRequest_
{
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public string? Address { get; set; }
    public IFormFile? ProfilePictureFile { get; set; }
}

// Login request
public class LoginRequest_
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}

// Change password request
public class ChangePasswordRequest
{
    [Required]
    [DataType(DataType.Password)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string NewPassword { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

// Forgot password request
public class ForgotPasswordRequest_
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

// Reset password request
public class ResetPasswordRequest_
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string NewPassword { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

// Confirm email request
public class ConfirmEmailRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
}

// Resend confirmation email request
public class ResendConfirmationEmailRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}   

public class UpdateProfileDTO
{
    public string? UserName { get; set; }
    
    public string? Name { get; set; }
    
    public IFormFile? ProfilePictureFile { get; set; }
    
    public string? Address { get; set; }
}

public class ChangePasswordDTO
{
    [Required]
    public string CurrentPassword { get; set; }
    
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; }
    
    [Required]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; }
}

public class ForgotPasswordDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
}

public class ResetPasswordDTO
{
    [Required]
    public string Token { get; set; }
    
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; }
    
    [Required]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; }
}