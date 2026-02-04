using Bookify_Backend.DTOs;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class TicketService
{
    private readonly ITicketRepository _ticketRepo;
    private readonly IEventRepository _eventRepo;
    private readonly IUnitOfWork _unitOfWork;

    public TicketService(ITicketRepository ticketRepo, IEventRepository eventRepo, IUnitOfWork unitOfWork)
    {
        _ticketRepo = ticketRepo;
        _eventRepo = eventRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Get all tickets for a specific event
    /// </summary>
    public async Task<List<TicketDto>> GetTicketsByEventIdAsync(int eventId)
    {
        var tickets = await _ticketRepo.GetTicketsByEventIdAsync(eventId);
        
        return tickets.Select(t => new TicketDto
        {
            Id = t.Id,
            EventId = t.EventId,
            TicketType = t.TicketType,
            Price = t.Price,
            QuantityAvailable = t.QuantityAvailable,
            QuantitySold = t.QuantitySold,
            LimitPerUser = t.LimitPerUser,
            Discount = t.Discount,
            IsRefundable = t.IsRefundable,
            PointsEarnedPerUnit = t.PointsEarnedPerUnit,
            SeatsDescription = t.SeatsDescription,
            CreatedOn = t.CreatedOn
        }).ToList();
    }

    /// <summary>
    /// Get ticket by ID
    /// </summary>
    public async Task<TicketDto?> GetTicketByIdAsync(int id)
    {
        var ticket = await _ticketRepo.GetByIdAsync(id);
        
        if (ticket == null || ticket.IsDeleted)
            return null;

        return new TicketDto
        {
            Id = ticket.Id,
            EventId = ticket.EventId,
            TicketType = ticket.TicketType,
            Price = ticket.Price,
            QuantityAvailable = ticket.QuantityAvailable,
            QuantitySold = ticket.QuantitySold,
            LimitPerUser = ticket.LimitPerUser,
            Discount = ticket.Discount,
            IsRefundable = ticket.IsRefundable,
            PointsEarnedPerUnit = ticket.PointsEarnedPerUnit,
            SeatsDescription = ticket.SeatsDescription,
            CreatedOn = ticket.CreatedOn
        };
    }

    /// <summary>
    /// Create a new ticket for an event
    /// </summary>
    public async Task<TicketDto> CreateTicketAsync(CreateTicketRequest request)
    {
        // Verify event exists
        var eventExists = await _eventRepo.ExistsAsync(request.EventId);
        if (!eventExists)
            throw new Exception("Event not found");
        if(request.QuantityAvailable < 0)
            throw new Exception("Quantity available cannot be negative");
        if(request.LimitPerUser < 0)
            throw new Exception("Limit per user cannot be negative");
        if(request.Price < 0)
            throw new Exception("Price cannot be negative");
        if(request.Discount != null && request.Discount < 0)
            throw new Exception("Discount cannot be negative");

        var ticket = new Ticket(
            eventId: request.EventId,
            ticketType: request.TicketType,
            quantityAvailable: request.QuantityAvailable,
            price: request.Price,
            limitPerUser: request.LimitPerUser,
            discount: request.Discount,
            isRefundable: request.IsRefundable ?? false,
            pointsEarnedPerUnit: request.PointsEarnedPerUnit,
            seatsDescription: request.SeatsDescription
        );

        await _ticketRepo.AddAsync(ticket);
        await _unitOfWork.SaveChangesAsync();

        return new TicketDto
        {
            Id = ticket.Id,
            EventId = ticket.EventId,
            TicketType = ticket.TicketType,
            Price = ticket.Price,
            QuantityAvailable = ticket.QuantityAvailable,
            QuantitySold = ticket.QuantitySold,
            LimitPerUser = ticket.LimitPerUser,
            Discount = ticket.Discount,
            IsRefundable = ticket.IsRefundable,
            PointsEarnedPerUnit = ticket.PointsEarnedPerUnit,
            SeatsDescription = ticket.SeatsDescription,
            CreatedOn = ticket.CreatedOn
        };
    }

    /// <summary>
    /// Update an existing ticket
    /// </summary>
    public async Task<TicketDto?> UpdateTicketAsync(int id, UpdateTicketRequest request)
    {
        var ticket = await _ticketRepo.GetByIdAsync(id);
        
        if (ticket == null || ticket.IsDeleted)
            return null;

        if (request.QuantityAvailable < 0)
            throw new Exception("Quantity available cannot be negative");
        if (request.LimitPerUser < 0)
            throw new Exception("Limit per user cannot be negative");
        if (request.Price < 0)
            throw new Exception("Price cannot be negative");
        if (request.Discount != null && request.Discount < 0)
            throw new Exception("Discount cannot be negative");

        ticket.Update(
            ticketType: request.TicketType,
            quantityAvailable: request.QuantityAvailable,
            price: request.Price,
            limitPerUser: request.LimitPerUser,
            discount: request.Discount,
            isRefundable: request.IsRefundable,
            pointsEarnedPerUnit: request.PointsEarnedPerUnit,
            seatsDescription: request.SeatsDescription
        );

        await _ticketRepo.UpdateAsync(ticket);
        await _unitOfWork.SaveChangesAsync();

        return new TicketDto
        {
            Id = ticket.Id,
            EventId = ticket.EventId,
            TicketType = ticket.TicketType,
            Price = ticket.Price,
            QuantityAvailable = ticket.QuantityAvailable,
            QuantitySold = ticket.QuantitySold,
            LimitPerUser = ticket.LimitPerUser,
            Discount = ticket.Discount,
            IsRefundable = ticket.IsRefundable,
            PointsEarnedPerUnit = ticket.PointsEarnedPerUnit,
            SeatsDescription = ticket.SeatsDescription,
            CreatedOn = ticket.CreatedOn
        };
    }

    /// <summary>
    /// Delete a ticket (soft delete)
    /// </summary>
    public async Task<bool> DeleteTicketAsync(int id)
    {
        var ticket = await _ticketRepo.GetByIdAsync(id);
        
        if (ticket == null || ticket.IsDeleted)
            return false;

        ticket.MarkAsDeleted();
        await _ticketRepo.UpdateAsync(ticket);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}

