using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Bookify_Backend.Entities;

namespace Bookify_Backend.DataBase;

public partial class DBContext : IdentityDbContext<User, IdentityRole, string>
{
    public DBContext(DbContextOptions<DBContext> options)
        : base(options)
    {
    }

    public DbSet<Event> Events => Set<Event>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationOrganizer> OrganizationOrganizers => Set<OrganizationOrganizer>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Redemption> Redemptions => Set<Redemption>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Reward> Rewards => Set<Reward>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        /* =========================
           CART
        ========================= */
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.id);

            entity.Property(e => e.created_on)
                .HasDefaultValueSql("now()");

            entity.HasOne(c => c.user)
                .WithOne(u => u.cart)
                .HasForeignKey<Cart>(c => c.user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        /* =========================
           CART ITEM
        ========================= */
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.id);

            entity.Property(e => e.added_on)
                .HasDefaultValueSql("now()");

            entity.Property(e => e.is_deleted)
                .HasDefaultValue(false);

            entity.HasOne(ci => ci.cart)
                .WithMany(c => c.cart_items)
                .HasForeignKey(ci => ci.cart_id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ci => ci.order)
                .WithMany(o => o.items)
                .HasForeignKey(ci => ci.order_id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.ToTable(t =>
                t.HasCheckConstraint(
                    "ck_cartitem_cart_or_order",
                    @"(cart_id IS NOT NULL AND order_id IS NULL)
           OR (cart_id IS NULL AND order_id IS NOT NULL)"
                )
            );
        });

        modelBuilder.Entity<CartItem>()
            .HasQueryFilter(ci => !ci.is_deleted);


        /* =========================
           ORDER
        ========================= */
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.id);

            entity.Property(e => e.order_date)
                .HasDefaultValueSql("now()");

            entity.Property(e => e.status)
                .HasDefaultValue("Pending");

            entity.Property(e => e.total_amount)
                .HasDefaultValue(0);

            entity.HasOne(o => o.user)
                .WithMany(u => u.orders)
                .HasForeignKey(o => o.user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });


        /* =========================
           PAYMENT
        ========================= */
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.id);

            entity.Property(e => e.payment_date)
                .HasDefaultValueSql("now()");

            entity.HasOne(p => p.order)
                .WithOne(o => o.payment)
                .HasForeignKey<Payment>(p => p.order_id)
                .OnDelete(DeleteBehavior.Cascade);
        });


        /* =========================
           REMAINING ENTITIES
           (unchanged domain relations)
        ========================= */

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AddedOn).HasDefaultValueSql("now()");
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedOn).HasDefaultValueSql("now()");
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedOn).HasDefaultValueSql("now()");
            entity.Property(e => e.QuantitySold).HasDefaultValue(0);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.Discount).HasDefaultValue(0);
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedOn).HasDefaultValueSql("now()");
            entity.Property(e => e.QuantitySold).HasDefaultValue(0);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Created_On).HasDefaultValueSql("now()");
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.LoyaltyPoints).HasDefaultValue(0);
        });
    }
}
