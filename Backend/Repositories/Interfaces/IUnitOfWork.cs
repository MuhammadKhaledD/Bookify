using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Unit of Work pattern - coordinates repositories and manages transactions
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // Entity repositories - using specific repository interfaces
    IEventRepository Events { get; }
    ITicketRepository Tickets { get; }
    IUserRepository Users { get; }
    ICartRepository Carts { get; }
    ICartItemRepository CartItems { get; }
    ICategoryRepository Categories { get; }
    IOrderRepository Orders { get; }
    IOrganizationRepository Organizations { get; }
    IOrganizationOrganizerRepository OrganizationOrganizers { get; }
    IPaymentRepository Payments { get; }
    IProductRepository Products { get; }
    IRedemptionRepository Redemptions { get; }
    IReviewRepository Reviews { get; }
    IRewardRepository Rewards { get; }
    IShopRepository Shops { get; }
    IStoreRepository Stores { get; }
    
    // Transaction management
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
