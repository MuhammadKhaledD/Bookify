using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories;
using Bookify_Backend.Repositories.Interfaces;
using Bookify_Backend.Helpers;
using Bookify_Backend.Services;

// Load environment variables from .env file (if using DotNetEnv)
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// -------------------------
// Configuration helpers
// -------------------------
var configuration = builder.Configuration;
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? configuration.GetConnectionString("DefaultConnection");
var hasDatabase = !string.IsNullOrEmpty(connectionString);

// -------------------------
// Database + Identity
// -------------------------
if (hasDatabase)
{
    Console.WriteLine("Configuring PostgreSQL database...");

    builder.Services.AddDbContext<DBContext>(options =>
        options.UseNpgsql(connectionString));
    Console.WriteLine("✓ DbContext configured successfully");

    // Configure Identity once, with options
    builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        // Password settings (adjust as desired)
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;

        options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
        // User settings
        options.User.RequireUniqueEmail = true;

        // Require confirmed email before sign-in
        options.SignIn.RequireConfirmedEmail = false;
    })
    .AddEntityFrameworkStores<DBContext>()
    .AddDefaultTokenProviders();

    Console.WriteLine("✓ Identity configured successfully");
}
else
{
    Console.WriteLine("⚠ WARNING: DATABASE_URL environment variable not set. Database functionality will be limited.");
}

// -------------------------
// JWT Authentication
// -------------------------
var jwtSection = configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
var issuer = jwtSection["Issuer"] ?? "Bookify";
var audience = jwtSection["Audience"] ?? "Bookify-Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Optional: support tokens from cookies if you use refresh tokens via cookies
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            if (string.IsNullOrEmpty(ctx.Token) && ctx.Request.Cookies.ContainsKey("accessToken"))
            {
                ctx.Token = ctx.Request.Cookies["accessToken"];
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// -------------------------
// CORS - allow frontend origin (needed for cookies)
// -------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy
            .WithOrigins("https://bookify-ticket-shop-rewards.lovable.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -------------------------
// Configure helpers & services
// -------------------------
// Bind EmailSettings and register EmailService BEFORE AuthService (important)
builder.Services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// Repository pattern (Unit of Work)
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Custom repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IOrganizationOrganizerRepository, OrganizationOrganizerRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IRedemptionRepository, RedemptionRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IRewardRepository, RewardRepository>();
builder.Services.AddScoped<IShopRepository, ShopRepository>();
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();


// Helpers
builder.Services.AddScoped<AuthHelper>();
builder.Services.AddScoped<AzureBlobHelper>();

// Application services (AuthService after IEmailService)
builder.Services.AddScoped<RoleServices>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrganizationService>();
builder.Services.AddScoped<StoreService>();
builder.Services.AddScoped<ShopService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<RewardService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<RedemptionService>();
builder.Services.AddScoped<UserManagementService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<OrganizationOrganizersService>();
Console.WriteLine("✓ Services & repositories configured successfully");

// -------------------------
// Controllers / JSON options
// -------------------------
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// -------------------------
// Swagger / OpenAPI
// -------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Bookify API",
        Version = "v1",
        Description = "API for Bookify - Event Booking Platform"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// -------------------------
// Host / app build
// -------------------------
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

Console.WriteLine($"🚀 Starting application on port {port}");

// -------------------------
// Middleware pipeline — ordering matters
// -------------------------
app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS must come before authentication/authorization for preflight + cookies
app.UseCors("FrontendCors");

// Only enable auth middlewares if DB/Identity is available (you configured it above)
if (hasDatabase)
{
    app.UseAuthentication();
    app.UseAuthorization();
}

// Map controllers and minimal endpoints
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"))
    .WithName("Root")
    .WithOpenApi()
    .ExcludeFromDescription();

app.MapGet("/api/test", () => Results.Ok(new
{
    message = "✓ API is working!",
    timestamp = DateTime.UtcNow,
    database = hasDatabase ? "Connected to PostgreSQL" : "Not connected",
    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
}))
.WithName("TestEndpoint")
.WithOpenApi();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    database = hasDatabase ? "connected" : "not connected"
}))
.WithName("HealthCheck")
.WithOpenApi();

Console.WriteLine("✓ All endpoints mapped successfully");
app.Run();
