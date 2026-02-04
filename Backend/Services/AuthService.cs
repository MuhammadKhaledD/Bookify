using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Bookify_Backend.Entities;
using Bookify_Backend.Helpers;
using Bookify_Backend.Models;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Bookify_Backend.Services;

public class AuthService
{
    private readonly IUserRepository _userRepo;
    private readonly UserManager<User> _userManager;
    private readonly AuthHelper _authHelper;
    private readonly AzureBlobHelper _blobHelper;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuthService> _logger;
    private readonly ICartRepository  _cartRepo;
    public AuthService(
        IUserRepository userRepo,
        UserManager<User> userManager,
        AuthHelper authHelper,
        AzureBlobHelper blobHelper,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ILogger<AuthService> logger,
        ICartRepository cartRepo)
    {
        _userRepo = userRepo;
        _userManager = userManager;
        _authHelper = authHelper;
        _blobHelper = blobHelper;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _cartRepo = cartRepo;
    }


    public async Task<object> RegisterAsync(RegisterRequest_ request, HttpResponse response, string confirmationUrl)
    {
        //  Check if email or username exists
        if (await _userRepo.IsEmailTakenAsync(request.Email))
            throw new Exception("Email is already registered");

        if (await _userRepo.IsUserNameTakenAsync(request.Username))
            throw new Exception("Username is already taken");

        //  Upload profile picture
        string profileUrl;
        if (request.ProfilePictureFile != null && request.ProfilePictureFile.Length > 0)
        {
            profileUrl = await _blobHelper.UploadImageAsync(request.ProfilePictureFile);
        }
        else
        {
            profileUrl = "https://ebraebra.blob.core.windows.net/profile/default.png";
        }

        //  Create new user
        var user = new User(request.Username, request.Email, profileUrl, request.Address, false, request.Name);
       

        //  Create user with UserManager 
        var createResult = await _userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            // Return validation errors
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            throw new Exception($"Registration failed: {errors}");
        }

        // Add user to default "User" role
        try
        {
            var addToRoleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!addToRoleResult.Succeeded)
            {
                _logger.LogWarning("Failed to add user to 'User' role: {Errors}",
                    string.Join(", ", addToRoleResult.Errors.Select(e => e.Description)));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user to default role");
        }


        //  Generate email confirmation token
        var emailToken =  _authHelper.GenerateEmailConfirmationToken(user);
        _logger.LogInformation(emailToken);

        var confirmationLink = $"{confirmationUrl}?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

        //  Send confirmation email
        try
        {
            await _emailService.SendEmailAsync(
                user.Email,
                "Confirm Your Email - Bookify",
                $@"
        <h2>Welcome to Bookify!</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <p>
            <a href='{confirmationLink}'
               style='background-color:#007bff;color:white;
               padding:10px 20px;text-decoration:none;
               border-radius:5px;display:inline-block;'>
               Confirm Email
            </a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href='{confirmationLink}'>{confirmationLink}</a></p>
        <p>This link will expire in 7 days.</p>
        ");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email to {Email}", user.Email);
        }

        //  Create cart for user
        await _cartRepo.AddAsync(new Cart(user.Id));
        await _unitOfWork.SaveChangesAsync();

        //  Return result
        return new
        {
            User = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Name,
                user.Address,
                user.ProfilePicture,
                EmailConfirmed = user.EmailConfirmed
            },
            Message = "Registration successful! Please check your email to confirm your account."
        };
    }

    public async Task<object> LoginAsync(LoginRequest_ request, HttpResponse response)
    {
        // Find user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");

        // Check if email is confirmed
        if (!user.EmailConfirmed)
            throw new UnauthorizedAccessException("Please confirm your email before logging in. Check your inbox for the confirmation link.");

        // Verify password
        var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid email or password");

        // Generate tokens
        var accessToken = await _authHelper.GenerateAccessTokenAsync(user);
        var refreshToken = _authHelper.GenerateRefreshToken(user);

        // Set refresh token as HttpOnly cookie
        response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.Now.AddDays(30)
        });

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        return new
        {
            AccessToken = accessToken,
            User = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Name,
                user.Address,
                user.ProfilePicture,
                Roles = roles
            }
        };
    }

    public Task LogoutAsync(string userId, HttpResponse response)
    {
        response.Cookies.Delete("refreshToken");
        return Task.CompletedTask;
    }
    

    public async Task<object> RefreshTokenAsync(HttpRequest request)
    {
        // 1. Get refresh token from HttpOnly cookie
        if (!request.Cookies.TryGetValue("refreshToken", out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedAccessException("Refresh token missing. Please log in.");
        }

        // 2. Validate refresh token
        if (!_authHelper.ValidateRefreshToken(refreshToken))
        {
            throw new UnauthorizedAccessException("Invalid refresh token. Please log in.");
        }

        // 3. Extract userId from refresh token
        var userId = _authHelper.GetUserIdFromToken(refreshToken);
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Invalid token. Please log in.");
        }

        // 4. Load user
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found. Please log in.");
        }

        // 5. Generate new access token
        var accessToken = await _authHelper.GenerateAccessTokenAsync(user);

        return new
        {
            accessToken
        };
    }

    
    public async Task<object> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Name,
            user.Address,
            user.ProfilePicture,
            user.EmailConfirmed,
            user.LoyaltyPoints,
            Roles = roles
        };
    }

    
public async Task<(bool Success, string Message)> ChangePasswordAsync(string userId, ChangePasswordDTO request)
{
    // 1️⃣ Find user by ID
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
    {
        _logger.LogWarning("Change password attempted for non-existent user: {UserId}", userId);
        throw new Exception("User not found");
    }

    // 2️⃣ Verify current password
    var isValidPassword = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
    if (!isValidPassword)
    {
        _logger.LogWarning("Invalid current password for user {UserId}", userId);
        throw new Exception("Current password is incorrect");
    }

    // 3️⃣ Change password
    var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        _logger.LogError("Failed to change password for user {UserId}: {Errors}", userId, errors);
        throw new Exception(errors);
    }

    // 4️⃣ Send confirmation email
    try
    {
        await _emailService.SendEmailAsync(
            user.Email,
            "Password Changed Successfully - Bookify",
            $@"
            <h2>Password Changed</h2>
            <p>Hi {user.Name ?? user.UserName},</p>
            <p>Your password has been successfully changed on {DateTime.Now:MMMM dd, yyyy} at {DateTime.Now:HH:mm} UTC.</p>
            <p><strong>If you did not make this change, please:</strong></p>
            <ul>
                <li>Reset your password immediately</li>
                <li>Contact our support team</li>
                <li>Check your account for unauthorized activity</li>
            </ul>
            <p>For security reasons, you may need to log in again on all your devices.</p>
            <p>Best regards,<br>The Bookify Team</p>
            ");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to send password change confirmation email to {Email}", user.Email);
        // Don't throw - password was changed successfully
    }

    _logger.LogInformation("Password changed successfully for user {UserId}", userId);
    return (true, "Password changed successfully");
}
public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordDTO request, string resetUrl)
{
    // 1️⃣ Find user by email
    var user = await _userManager.FindByEmailAsync(request.Email);

    // 2️⃣ Always return success to prevent email enumeration (security)
    if (user == null)
    {
        _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
        return (true, "If your email is registered, you will receive a password reset link.");
    }

    // 3️⃣ Generate password reset token (using YOUR custom helper)
    var token = _authHelper.GeneratePasswordResetToken(user);
    _logger.LogInformation("Password reset token generated for user {Email}", user.Email);

    // 4️⃣ Create reset link (token will be validated on reset)
    var resetLink = $"{resetUrl}?token={Uri.EscapeDataString(token)}";

    // 5️⃣ Send email with reset link
    try
    {
        await _emailService.SendEmailAsync(
            user.Email,
            "Reset Your Password - Bookify",
            $@"
            <h2>Password Reset Request</h2>
            <p>Hi {user.Name ?? user.UserName},</p>
            <p>We received a request to reset your password for your Bookify account.</p>
            <p>Click the button below to reset your password:</p>
            <p>
                <a href='{resetLink}' 
                   style='background-color: #007bff; color: white; 
                   padding: 12px 24px; text-decoration: none; 
                   border-radius: 5px; display: inline-block; 
                   font-weight: bold;'>
                   Reset Password
                </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href='{resetLink}'>{resetLink}</a></p>
            <p><strong>Important:</strong></p>
            <ul>
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>Your password will not change unless you complete the reset process</li>
            </ul>
            <p>Best regards,<br>The Bookify Team</p>
            ");

        _logger.LogInformation("Password reset email sent successfully to {Email}", user.Email);
        return (true, "If your email is registered, you will receive a password reset link.");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to send password reset email to {Email}", request.Email);
        throw new Exception("Failed to send password reset email. Please try again later.");
    }
}
    

public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDTO request)
{
    // 1️⃣ Validate token (exactly like email confirmation!)
    var (isValid, userId, email) = _authHelper.ValidatePasswordResetToken(request.Token);

    if (!isValid)
    {
        _logger.LogWarning("Invalid or expired password reset token");
        throw new Exception("Invalid or expired password reset token. Please request a new one.");
    }

    // 2️⃣ Load user by ID from token
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
    {
        _logger.LogError("User not found for password reset: {UserId}", userId);
        throw new Exception("User not found.");
    }

    // 3️⃣ Verify email matches (security check)
    if (user.Email != email)
    {
        _logger.LogWarning("Email mismatch in password reset for user {UserId}", userId);
        throw new Exception("Invalid password reset request.");
    }

    // 4️⃣ Remove old password
    var removePasswordResult = await _userManager.RemovePasswordAsync(user);
    if (!removePasswordResult.Succeeded)
    {
        _logger.LogError("Failed to remove password for user {UserId}", userId);
        throw new Exception("Failed to reset password. Please try again.");
    }

    // 5️⃣ Add new password
    var addPasswordResult = await _userManager.AddPasswordAsync(user, request.NewPassword);
    if (!addPasswordResult.Succeeded)
    {
        var errors = string.Join(", ", addPasswordResult.Errors.Select(e => e.Description));
        _logger.LogError("Failed to add new password for user {UserId}: {Errors}", userId, errors);
        throw new Exception($"Failed to set new password: {errors}");
    }

    // 6️⃣ Send confirmation email
    try
    {
        await _emailService.SendEmailAsync(
            user.Email,
            "Password Reset Successful - Bookify",
            $@"
            <h2>Password Reset Successful</h2>
            <p>Hi {user.Name ?? user.UserName},</p>
            <p>Your password has been successfully reset on {DateTime.Now:MMMM dd, yyyy} at {DateTime.Now:HH:mm} UTC.</p>
            <p>You can now log in with your new password.</p>
            <p><strong>If you did not make this change:</strong></p>
            <ul>
                <li>Someone may have unauthorized access to your account</li>
                <li>Contact our support team immediately</li>
                <li>Secure your email account</li>
            </ul>
            <p>Best regards,<br>The Bookify Team</p>
            ");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to send password reset confirmation email to {Email}", user.Email);
        // Don't throw - password was changed successfully
    }

    _logger.LogInformation("Password reset successfully for user {UserId}", userId);
    return (true, "Password reset successfully. You can now log in with your new password.");
}
    
    public async Task<object> ConfirmEmailAsync(string token, HttpResponse response)
    {
        // 1️⃣ Validate confirmation token (your custom helper)
        var (isValid, userId, email) = _authHelper.ValidateEmailConfirmationToken(token);

        if (!isValid)
            throw new Exception("Invalid or expired email confirmation token.");

        // 2️⃣ Load user
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found.");

        if (user.Email != email)
            throw new Exception("Invalid email confirmation request.");

        if (user.EmailConfirmed)
            throw new Exception("Email already confirmed.");

        // 3️⃣ Confirm email
        user.EmailConfirmed = true;
        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
            throw new Exception("Failed to confirm email.");

        // 4️⃣ Generate auth tokens (AUTO LOGIN)
        var accessToken = await _authHelper.GenerateAccessTokenAsync(user);
        var refreshToken = _authHelper.GenerateRefreshToken(user);

        // 5️⃣ Set refresh token cookie
        response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.Now.AddDays(30)
        });
        _logger.LogInformation("Email confirmed for user {response.Cookies}", user.Email);


        // 6️⃣ Send welcome email (optional)
        try
        {
            await _emailService.SendEmailAsync(
                user.Email,
                "Welcome to Bookify!",
                @"
                <h2>Email Confirmed Successfully!</h2>
                <p>Welcome to Bookify! Your email has been confirmed.</p>
                <p>You are now logged in and can start using the platform.</p>
                ");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email");
        }

        // 7️⃣ Return tokens + user info
        return new
        {
            AccessToken = accessToken,
            User = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Name,
                user.Address,
                user.ProfilePicture,
                EmailConfirmed = user.EmailConfirmed
            }
        };
    }

    public async Task<(bool Success, string Message)> ResendConfirmationEmailAsync(string email, string confirmationUrl)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            // Don't reveal that user doesn't exist
            return (true, "If your email is registered, you will receive a confirmation link.");
        }

        if (user.EmailConfirmed)
        {
            return (false, "Email is already confirmed.");
        }

        // Generate new confirmation token
        var token = _authHelper.GenerateEmailConfirmationToken(user);
        var confirmationLink = $"{confirmationUrl}?token={Uri.EscapeDataString(token)}";

        try
        {
            await _emailService.SendEmailAsync(
                user.Email,
                "Confirm Your Email - Bookify (Resend)",
                $@"
                <h2>Email Confirmation</h2>
                <p>Please confirm your email address by clicking the link below:</p>
                <p><a href='{confirmationLink}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Confirm Email</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href='{confirmationLink}'>{confirmationLink}</a></p>
                <p>This link will expire in 7 days.</p>
                ");

            return (true, "Confirmation email has been resent. Please check your inbox.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resend confirmation email");
            throw new Exception("Failed to send confirmation email. Please try again later.");
        }
    }

    public async Task<object> UpdateProfileAsync(string userId, UpdateProfileDTO request)
{
    // 1️⃣ Find user by ID
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
    {
        _logger.LogWarning("Update profile attempted for non-existent user: {UserId}", userId);
        throw new Exception("User not found");
    }

    // 2️⃣ Check if username is being changed and if it's already taken
    if (!string.IsNullOrWhiteSpace(request.UserName) && 
        request.UserName != user.UserName)
    {
        var isUserNameTaken = await _userRepo.IsUserNameTakenAsync(request.UserName);
        if (isUserNameTaken)
        {
            _logger.LogWarning("Username {UserName} is already taken", request.UserName);
            throw new Exception("Username is already taken");
        }
    }

    // 3️⃣ Upload new profile picture if provided
    string? profileUrl = null;
    if (request.ProfilePictureFile != null && request.ProfilePictureFile.Length > 0)
    {
        try
        {
            profileUrl = await _blobHelper.UploadImageAsync(request.ProfilePictureFile);
            _logger.LogInformation("Profile picture uploaded for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload profile picture for user {UserId}", userId);
            throw new Exception("Failed to upload profile picture");
        }
    }

    // 4️⃣ Update user profile using the entity's method
    user.UpdateProfile(
        Username: request.UserName,
        Name: request.Name,
        profilepicture: profileUrl,
        address: request.Address
    );

    // 5️⃣ Save changes
    var updateResult = await _userManager.UpdateAsync(user);
    if (!updateResult.Succeeded)
    {
        var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
        _logger.LogError("Failed to update profile for user {UserId}: {Errors}", userId, errors);
        throw new Exception($"Failed to update profile: {errors}");
    }

    await _unitOfWork.SaveChangesAsync();

    _logger.LogInformation("Profile updated successfully for user {UserId}", userId);

    // 6️⃣ Return updated user info
    return new
    {
        User = new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Name,
            user.Address,
            user.ProfilePicture,
            user.EmailConfirmed,
            user.LoyaltyPoints
        },
        Message = "Profile updated successfully"
    };
}
}