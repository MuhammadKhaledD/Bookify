using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class StoreService
{
    private readonly IStoreRepository _storeRepo;
    private readonly IOrganizationRepository _orgRepo;
    private readonly IUnitOfWork _unitOfWork;

    public StoreService(IStoreRepository storeRepo, IOrganizationRepository orgRepo, IUnitOfWork unitOfWork)
    {
        _storeRepo = storeRepo;
        _orgRepo = orgRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Create a new store
    /// </summary>
    public async Task<Store?> CreateStoreAsync(int? orgId, string name, string? description = null,
        bool status = true, string? storeLogo = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null; // Name is required
        }

        // Verify organization exists if orgId is provided
        if (orgId.HasValue && !await _orgRepo.ExistsAsync(orgId.Value))
        {
            return null; // Organization doesn't exist
        }

        var store = new Store(orgId, name, description, status, storeLogo);

        await _storeRepo.AddAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return store;
    }

    /// <summary>
    /// Get store by ID with details
    /// </summary>
    public async Task<Store?> GetStoreByIdAsync(int id)
    {
        var store = await _storeRepo.GetByIdWithDetailsAsync(id);

        if (store == null)
        {
            return null;
        }

        return store;
    }

    /// <summary>
    /// Update an existing store
    /// </summary>
    public async Task<bool> UpdateStoreAsync(int id, string? name = null, string? description = null,
        bool? status = null, string? storeLogo = null)
    {
        // Check if store exists
        if (!await _storeRepo.ExistsAsync(id))
        {
            return false;
        }

        var store = await _storeRepo.GetByIdAsync(id);

        if (store == null)
        {
            return false;
        }

        // Use the Store's Update method
        store.Update(name, description, status, storeLogo);

        await _storeRepo.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Delete a store (hard delete since Store doesn't have IsDeleted)
    /// </summary>
    public async Task<bool> DeleteStoreAsync(int id)
    {
        // Check if store exists
        if (!await _storeRepo.ExistsAsync(id))
        {
            return false;
        }

        var store = await _storeRepo.GetByIdAsync(id);

        if (store == null)
        {
            return false;
        }

        await _storeRepo.DeleteAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<object?> GetStoreByOrgIdAsync(int id)
    {
        var store = await _storeRepo.GetStoreByOrganizationIdAsync(id);

        if (store == null)
        {
            return null;
        }

        return store;
    }
}

