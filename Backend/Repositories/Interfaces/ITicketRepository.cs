﻿using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Ticket repository interface with ticket-specific queries
/// </summary>
public interface ITicketRepository
{
    // Basic CRUD
    Task<Ticket?> GetByIdAsync(int id);
    Task<IEnumerable<Ticket>> GetAllAsync();
    Task<Ticket> AddAsync(Ticket entity);
    Task<IEnumerable<Ticket>> AddRangeAsync(IEnumerable<Ticket> entities);
    Task UpdateAsync(Ticket entity);
    Task DeleteAsync(Ticket entity);
    Task DeleteRangeAsync(IEnumerable<Ticket> entities);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    /// <summary>
    /// Get all tickets for a specific event
    /// </summary>
    Task<IEnumerable<Ticket>> GetTicketsByEventIdAsync(int eventId);

    /// <summary>
    /// Get ticket by ID with event details
    /// </summary>
    Task<Ticket?> GetTicketByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get available (non-sold-out) tickets for an event
    /// </summary>
    Task<IEnumerable<Ticket>> GetAvailableTicketsByEventIdAsync(int eventId);

    /// <summary>
    /// Check if a ticket belongs to a specific organization
    /// </summary>
    Task<bool> IsTicketOwnedByOrganizationAsync(int ticketId, int orgId);

    /// <summary>
    /// Check if a ticket belongs to organizations in a list
    /// </summary>
    Task<bool> IsTicketOwnedByOrganizationsAsync(int ticketId, IEnumerable<int> orgIds);
}

