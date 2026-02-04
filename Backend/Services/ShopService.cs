﻿using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class ShopService
{
    private readonly IShopRepository _shopRepo;
    private readonly IEventRepository _eventRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ShopService(IShopRepository shopRepo, IEventRepository eventRepo, IUnitOfWork unitOfWork)
    {
        _shopRepo = shopRepo;
        _eventRepo = eventRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Create a new shop
    /// </summary>
    public async Task<Shop?> CreateShopAsync(int? eventId, string name, string? description = null,
        bool status = true, string? shopLogo = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null; // Name is required
        }

        // Verify event exists if eventId is provided
        if (eventId.HasValue && !await _eventRepo.ExistsAsync(eventId.Value))
        {
            return null; // Event doesn't exist
        }

        var shop = new Shop(eventId, name, description, status, shopLogo);

        await _shopRepo.AddAsync(shop);
        await _unitOfWork.SaveChangesAsync();

        return shop;
    }

    /// <summary>
    /// Get shop by ID with details
    /// </summary>
    public async Task<Shop?> GetShopByIdAsync(int id)
    {
        var shop = await _shopRepo.GetByIdWithDetailsAsync(id);

        if (shop == null)
        {
            return null;
        }

        return shop;
    }

    /// <summary>
    /// Get shop by event ID
    /// </summary>
    public async Task<Shop?> GetShopByEventIdAsync(int eventId)
    {
        var shop = await _shopRepo.GetShopByEventIdAsync(eventId);

        if (shop == null)
        {
            return null;
        }

        return shop;
    }

    /// <summary>
    /// Update an existing shop
    /// </summary>
    public async Task<bool> UpdateShopAsync(int id, string? name = null, string? description = null,
        bool? status = null, string? shopLogo = null)
    {
        // Check if shop exists
        if (!await _shopRepo.ExistsAsync(id))
        {
            return false;
        }

        var shop = await _shopRepo.GetByIdAsync(id);

        if (shop == null)
        {
            return false;
        }

        // Use the Shop's Update method
        shop.Update(name, description, status, shopLogo);

        await _shopRepo.UpdateAsync(shop);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Delete a shop (hard delete since Shop doesn't have IsDeleted)
    /// </summary>
    public async Task<bool> DeleteShopAsync(int id)
    {
        // Check if shop exists
        if (!await _shopRepo.ExistsAsync(id))
        {
            return false;
        }

        var shop = await _shopRepo.GetByIdAsync(id);

        if (shop == null)
        {
            return false;
        }

        await _shopRepo.DeleteAsync(shop);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}

