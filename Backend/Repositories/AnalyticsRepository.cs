using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories
{
    /// <summary>
    /// Analytics repository for raw SQL stored procedures
    /// </summary>
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly DBContext _context;

        public AnalyticsRepository(DBContext context)
        {
            _context = context;
        }

        public async Task<List<OrgEarningsDto>> GetOrgEarningsAsync()
        {
            return await _context.Database
                .SqlQueryRaw<OrgEarningsDto>("SELECT * FROM get_org_earnings()")
                .ToListAsync();
        }

        public async Task<List<EventAttendanceDto>> GetEventAttendanceAsync()
        {
            return await _context.Database
                .SqlQueryRaw<EventAttendanceDto>("SELECT * FROM get_event_attendance()")
                .ToListAsync();
        }

        public async Task<UserActivityStatsDto> GetUserActivityStatsAsync()
        {
            var result = await _context.Database
                .SqlQueryRaw<UserActivityStatsDto>("SELECT * FROM get_user_activity_stats()")
                .FirstOrDefaultAsync();
            
            return result ?? new UserActivityStatsDto();
        }

        public async Task<List<UserPaymentDto>> GetUserPaymentsAsync()
        {
            return await _context.Database
                .SqlQueryRaw<UserPaymentDto>("SELECT * FROM get_user_payments()")
                .ToListAsync();
        }

        public async Task<List<TopEventRevenueDto>> GetTopEventsByRevenueAsync()
        {
            return await _context.Database
                .SqlQueryRaw<TopEventRevenueDto>("SELECT * FROM get_top_events_by_revenue()")
                .ToListAsync();
        }

        public async Task<List<UserLoyaltySummaryDto>> GetUserLoyaltySummaryAsync()
        {
            return await _context.Database
                .SqlQueryRaw<UserLoyaltySummaryDto>("SELECT * FROM get_user_loyalty_summary()")
                .ToListAsync();
        }

        public async Task<List<RefundableTicketsDto>> GetRefundableTicketsAsync()
        {
            return await _context.Database
                .SqlQueryRaw<RefundableTicketsDto>("SELECT * FROM get_refundable_tickets()")
                .ToListAsync();
        }

        public async Task<List<OrgRevenueBreakdownDto>> GetOrgRevenueBreakdownAsync()
        {
            return await _context.Database
                .SqlQueryRaw<OrgRevenueBreakdownDto>("SELECT * FROM get_org_revenue_breakdown()")
                .ToListAsync();
        }

        public async Task<List<UserEngagementScoreDto>> GetUserEngagementScoreAsync()
        {
            return await _context.Database
                .SqlQueryRaw<UserEngagementScoreDto>("SELECT * FROM get_user_engagement_score()")
                .ToListAsync();
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var result = await _context.Database
                .SqlQueryRaw<DashboardStatsDto>("SELECT * FROM get_dashboard_stats()")
                .FirstOrDefaultAsync();
            
            return result ?? new DashboardStatsDto();
        }
    }
}