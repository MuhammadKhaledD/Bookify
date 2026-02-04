﻿using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Ticket-specific repository with custom queries
/// </summary>
public class TicketRepository : ITicketRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Ticket> _dbSet;

    public TicketRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Ticket>();
    }

    #region Basic CRUD

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<Ticket> AddAsync(Ticket entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public async Task<IEnumerable<Ticket>> AddRangeAsync(IEnumerable<Ticket> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        return entities;
    }

    public Task UpdateAsync(Ticket entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Ticket entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public Task DeleteRangeAsync(IEnumerable<Ticket> entities)
    {
        _dbSet.RemoveRange(entities);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(t => t.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _dbSet.CountAsync();
    }

    #endregion

    #region Query Builders (Private Helpers)

    private IQueryable<Ticket> GetBaseQueryWithIncludes()
    {
        return _dbSet
            .Include(t => t._event)
                .ThenInclude(e => e.org)
            .Include(t => t._event)
                .ThenInclude(e => e.category);
    }

    #endregion

    #region Read Operations with Filters

    public async Task<IEnumerable<Ticket>> GetTicketsByEventIdAsync(int eventId)
    {
        return await GetBaseQueryWithIncludes()
            .Where(t => t.EventId == eventId && !t.IsDeleted)
            .OrderBy(t => t.Price)
            .ToListAsync();
    }

    public async Task<Ticket?> GetTicketByIdWithDetailsAsync(int id)
    {
        return await GetBaseQueryWithIncludes()
            .Where(t => t.Id == id && !t.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Ticket>> GetAvailableTicketsByEventIdAsync(int eventId)
    {
        return await GetBaseQueryWithIncludes()
            .Where(t => t.EventId == eventId && 
                        !t.IsDeleted && 
                        (t.QuantityAvailable - t.QuantitySold) > 0)
            .OrderBy(t => t.Price)
            .ToListAsync();
    }

    public async Task<bool> IsTicketOwnedByOrganizationAsync(int ticketId, int orgId)
    {
        return await _dbSet
            .Include(t => t._event)
            .AnyAsync(t => t.Id == ticketId && 
                          t._event.OrgId == orgId && 
                          !t.IsDeleted);
    }

    public async Task<bool> IsTicketOwnedByOrganizationsAsync(int ticketId, IEnumerable<int> orgIds)
    {
        return await _dbSet
            .Include(t => t._event)
            .AnyAsync(t => t.Id == ticketId && 
                          orgIds.Contains(t._event.OrgId) && 
                          !t.IsDeleted);
    }

    #endregion
}

