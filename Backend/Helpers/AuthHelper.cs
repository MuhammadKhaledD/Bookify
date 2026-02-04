using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bookify_Backend.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Bookify_Backend.Helpers
{
    public class AuthHelper
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<AuthHelper> _logger;


        public AuthHelper(IConfiguration configuration, UserManager<User> userManager ,ILogger<AuthHelper> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _logger = logger;
            
        }

        // --- Generate Access Token with ALL User Roles ---
        public async Task<string> GenerateAccessTokenAsync(User user)
        {
            var jwt = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? throw new InvalidOperationException()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddMinutes(int.Parse(jwt["AccessTokenExpirationMinutes"] ?? "60"));

            // Get all user roles from UserManager
            var roles = await _userManager.GetRolesAsync(user);

            // Build claims list
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add all roles as separate claims (required for [Authorize(Roles = "Admin")] to work)
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"] ?? "Bookify",
                audience: jwt["Audience"] ?? "Bookify-Client",
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- Generate Refresh Token ---
        public string GenerateRefreshToken(User user)
        {
            var jwt = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? throw new InvalidOperationException()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddDays(7);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("type", "refresh")
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"] ?? "Bookify",
                audience: jwt["Audience"] ?? "Bookify-Client",
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- Generate Password Reset Token (JWT-based) ---
        public string GeneratePasswordResetToken(User user)
        {
            var jwt = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? throw new InvalidOperationException()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim("purpose", "password-reset"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"] ?? "Bookify",
                audience: "password-reset",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- Generate Email Confirmation Token (JWT-based) ---
        public string GenerateEmailConfirmationToken(User user)
        {
            var jwt = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim("purpose", "email-confirmation"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"] ?? "Bookify",
                audience: "email-confirmation",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );
            
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation("=====================");
            _logger.LogInformation("Generated email confirmation token for user {UserId}: {Token}", user.Id, tokenString);
            _logger.LogInformation("=====================");            return tokenString;
        }   
        // --- Validate Access Token ---
        public bool ValidateAccessToken(string token)
        {
            var jwt = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? throw new InvalidOperationException()));

            try
            {
                var handler = new JwtSecurityTokenHandler();
                handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwt["Issuer"] ?? "Bookify",
                    ValidateAudience = true,
                    ValidAudience = jwt["Audience"] ?? "Bookify-Client",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                return true;
            }
            catch
            {
                return false;
            }
        }

        // --- Validate Refresh Token ---
        public bool ValidateRefreshToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"] ?? throw new InvalidOperationException()));

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"] ?? "Bookify",
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"] ?? "Bookify-Client",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var typeClaim = principal.FindFirst("type")?.Value;
                return typeClaim == "refresh";
            }
            catch
            {
                return false;
            }
        }

        // --- Validate Password Reset Token ---
        public (bool IsValid, string UserId, string Email) ValidatePasswordResetToken(string token)
        {
            try
            {
                var jwt = _configuration.GetSection("JwtSettings");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? throw new InvalidOperationException()));

                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwt["Issuer"] ?? "Bookify",
                    ValidateAudience = true,
                    ValidAudience = "password-reset",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var purposeClaim = principal.FindFirst("purpose")?.Value;
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;

                if (purposeClaim == "password-reset" && !string.IsNullOrEmpty(userIdClaim) && !string.IsNullOrEmpty(emailClaim))
                {
                    return (true, userIdClaim, emailClaim);
                }

                return (false, null, null);
            }
            catch
            {
                return (false, null, null);
            }
        }

        // --- Validate Email Confirmation Token ---
        public (bool IsValid, string UserId, string Email) ValidateEmailConfirmationToken(string token)
        {
            try
            {
                var jwt = _configuration.GetSection("JwtSettings");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]));

                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwt["Issuer"] ?? "Bookify",
                    ValidateAudience = true,
                    ValidAudience = "email-confirmation",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var purposeClaim = principal.FindFirst("purpose")?.Value;
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;

                if (purposeClaim == "email-confirmation" && !string.IsNullOrEmpty(userIdClaim) && !string.IsNullOrEmpty(emailClaim))
                {
                    return (true, userIdClaim, emailClaim);
                }

                return (false, null, null);
            }
            catch
            {
                return (false, null, null);
            }
        }
        // --- Extract User ID from Token ---
        public string GetUserIdFromToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                return jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}