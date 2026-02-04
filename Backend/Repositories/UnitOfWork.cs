using Bookify_Backend.DataBase;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Unit of Work implementation - manages repositories and transactions
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly DBContext _context;
    private IDbContextTransaction? _transaction;

    // Repository instances (lazy initialization)
    private IEventRepository? _events;
    private ITicketRepository? _tickets;
    private IUserRepository? _users;
    private ICartRepository? _carts;
    private ICartItemRepository? _cartItems;
    private ICategoryRepository? _categories;
    private IOrderRepository? _orders;
    private IOrganizationRepository? _organizations;
    private IOrganizationOrganizerRepository? _organizationOrganizers;
    private IPaymentRepository? _payments;
    private IProductRepository? _products;
    private IRedemptionRepository? _redemptions;
    private IReviewRepository? _reviews;
    private IRewardRepository? _rewards;
    private IShopRepository? _shops;
    private IStoreRepository? _stores;

    public UnitOfWork(DBContext context)
    {
        _context = context;
    }

    #region Repository Properties (Lazy Initialization)

    public IEventRepository Events
    {
        get { return _events ??= new EventRepository(_context); }
    }

    public ITicketRepository Tickets
    {
        get { return _tickets ??= new TicketRepository(_context); }
    }

    public IUserRepository Users
    {
        get { return _users ??= new UserRepository(_context); }
    }

    public ICartRepository Carts
    {
        get { return _carts ??= new CartRepository(_context); }
    }

    public ICartItemRepository CartItems
    {
        get { return _cartItems ??= new CartItemRepository(_context); }
    }

    public ICategoryRepository Categories
    {
        get { return _categories ??= new CategoryRepository(_context); }
    }

    public IOrderRepository Orders
    {
        get { return _orders ??= new OrderRepository(_context); }
    }

    public IOrganizationRepository Organizations
    {
        get { return _organizations ??= new OrganizationRepository(_context); }
    }

    public IOrganizationOrganizerRepository OrganizationOrganizers
    {
        get { return _organizationOrganizers ??= new OrganizationOrganizerRepository(_context); }
    }

    public IPaymentRepository Payments
    {
        get { return _payments ??= new PaymentRepository(_context); }
    }

    public IProductRepository Products
    {
        get { return _products ??= new ProductRepository(_context); }
    }

    public IRedemptionRepository Redemptions
    {
        get { return _redemptions ??= new RedemptionRepository(_context); }
    }

    public IReviewRepository Reviews
    {
        get { return _reviews ??= new ReviewRepository(_context); }
    }

    public IRewardRepository Rewards
    {
        get { return _rewards ??= new RewardRepository(_context); }
    }

    public IShopRepository Shops
    {
        get { return _shops ??= new ShopRepository(_context); }
    }

    public IStoreRepository Stores
    {
        get { return _stores ??= new StoreRepository(_context); }
    }

    #endregion

    #region Transaction Management

    /// <summary>
    /// Save all changes to the database
    /// </summary>
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Begin a database transaction
    /// </summary>
    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    public async Task CommitTransactionAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region Dispose

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }

    #endregion
}

