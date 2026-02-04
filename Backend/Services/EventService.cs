using Bookify_Backend.DTOs;
using Bookify_Backend.Entities;
using Bookify_Backend.Helpers;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class EventService
{
    private readonly IEventRepository _eventRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IOrganizationRepository _orgRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AzureBlobHelper _blobHelper;

    public EventService(IEventRepository eventRepo, ICategoryRepository categoryRepo, 
        IOrganizationRepository orgRepo, IUnitOfWork unitOfWork,AzureBlobHelper _blobHelper)
    {
        _eventRepo = eventRepo;
        _categoryRepo = categoryRepo;
        _orgRepo = orgRepo;
        _unitOfWork = unitOfWork;
        this._blobHelper = _blobHelper;
    }
    
    public async Task<List<EventSummaryDto>> GetAllEventsAsync()
    {
        var events = await _eventRepo.GetAllAsync();
        
        return events.Where(e => !e.IsDeleted)
            .Select(e => new EventSummaryDto
            {
                Id = e.Id,
                Title = e.Title,
                ImageUrl = e.Image_Url,
                EventDate = e.EventDate,
                LocationName = e.LocationName,
                CategoryName = e.category.Name,
                OrganizationName = e.org.Name,
                MinPrice = e.tickets.Where(t => !t.IsDeleted).Any() 
                    ? e.tickets.Where(t => !t.IsDeleted).Min(t => t.Price) 
                    : null,
                Status = e.Status
            }).ToList();
    }
    
    public async Task<EventDetailsDto?> GetEventByIdAsync(int id)
    {
        var e = await _eventRepo.GetEventByIdWithDetailsAsync(id);
        
        if (e == null)
            return null;

        return new EventDetailsDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            ImageUrl = e.Image_Url,
            EventDate = e.EventDate,
            LocationName = e.LocationName,
            LocationAddress = e.LocationAddress,
            CategoryId = e.CategoryId,
            CategoryName = e.category.Name,
            OrganizationId = e.OrgId,
            OrganizationName = e.org.Name,
            Status = e.Status,
            Capacity = e.Capacity,
            AgeRestriction = e.Age_Restriction,
            MinPrice = e.tickets.Where(t => !t.IsDeleted).Any() 
                ? e.tickets.Where(t => !t.IsDeleted).Min(t => t.Price) 
                : null,
            AddedOn = e.AddedOn,
            UpdatedOn = e.UpdatedOn
        };
    }
    
    /// <summary>
    /// Create a new event
    /// </summary>
    public async Task<(Event? Event, string? Error)> CreateEventAsync(int orgId, int categoryId, string title, string description,
        string locationAddress, DateTime eventDate, int capacity, string? locationName = null, 
        int? ageRestriction = null, IFormFile? imageUrl = null)
    {
        // Validate organization exists
        var orgExists = await _orgRepo.ExistsAsync(orgId);
        if (!orgExists)
        {
            return (null, $"Organization with ID {orgId} does not exist");
        }

        // Check if organization is deleted
        var org = await _orgRepo.GetByIdAsync(orgId);
        if (org == null || org.IsDeleted)
        {
            return (null, $"Organization with ID {orgId} is deleted or not found");
        }

        // Validate category exists
        var categoryExists = await _categoryRepo.ExistsAsync(categoryId);
        if (!categoryExists)
        {
            return (null, $"Category with ID {categoryId} does not exist");
        }

        // Check if category is deleted
        var category = await _categoryRepo.GetByIdAsync(categoryId);
        if (category == null || category.IsDeleted)
        {
            return (null, $"Category with ID {categoryId} is deleted or not found");
        }
        string eventurl;
        if (imageUrl != null && imageUrl.Length > 0)
        {
            eventurl = await _blobHelper.UploadImageAsync(imageUrl);
        }
        else
        {
            eventurl = "https://ebraebra.blob.core.windows.net/profile/default.png";
        }
        if(ageRestriction != null && ageRestriction < 0)
        {
            return (null, "Age restriction cannot be negative");
        }
        if(capacity < 0)
        {
            return (null, "Capacity cannot be negative");
        }

        var newEvent = new Event(orgId, categoryId, title, description, locationAddress, 
            eventDate, capacity, locationName, ageRestriction, eventurl);

        await _eventRepo.AddAsync(newEvent);
        await _unitOfWork.SaveChangesAsync();

        return (newEvent, null);
    }

    /// <summary>
    /// Update an existing event
    /// </summary>
    public async Task<bool> UpdateEventAsync(int id, string? title = null, string? description = null,
        string? locationName = null, string? locationAddress = null, DateTime? eventDate = null,
        int? capacity = null, int? ageRestriction = null, IFormFile? imageUrl = null, string? status = null)
    {
        var existingEvent = await _eventRepo.GetByIdAsync(id);

        if (existingEvent == null || existingEvent.IsDeleted)
        {
            return false;
        }
        string eventurl;
        if (imageUrl != null && imageUrl.Length > 0)
        {
            eventurl = await _blobHelper.UploadImageAsync(imageUrl);
        }
        else
        {
            eventurl = null;
        }
        if(ageRestriction != null && ageRestriction < 0)
        {
            return false;
        }
        if(capacity != null && capacity < 0)
        {
            return false;
        }

        // Use the Event's Update method
        existingEvent.Update(title, description, locationName, locationAddress, 
            eventDate, capacity, ageRestriction, eventurl);

        // Update status if provided
        if (!string.IsNullOrWhiteSpace(status))
        {
            existingEvent.UpdateStatus(status);
        }

        await _eventRepo.UpdateAsync(existingEvent);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Delete an event (soft delete)
    /// </summary>
    public async Task<bool> DeleteEventAsync(int id)
    {
        var existingEvent = await _eventRepo.GetByIdAsync(id);

        if (existingEvent == null || existingEvent.IsDeleted)
        {
            return false;
        }

        // Use the Event's MarkAsDeleted method
        existingEvent.MarkAsDeleted();

        await _eventRepo.UpdateAsync(existingEvent);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
