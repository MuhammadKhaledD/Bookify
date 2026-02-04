using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces
{
    public interface IAnalyticsRepository
    {
        Task<List<OrgEarningsDto>> GetOrgEarningsAsync();
        Task<List<EventAttendanceDto>> GetEventAttendanceAsync();
        Task<UserActivityStatsDto> GetUserActivityStatsAsync();
        Task<List<UserPaymentDto>> GetUserPaymentsAsync();
        Task<List<TopEventRevenueDto>> GetTopEventsByRevenueAsync();
        Task<List<UserLoyaltySummaryDto>> GetUserLoyaltySummaryAsync();
        Task<List<RefundableTicketsDto>> GetRefundableTicketsAsync();
        Task<List<OrgRevenueBreakdownDto>> GetOrgRevenueBreakdownAsync();
        Task<List<UserEngagementScoreDto>> GetUserEngagementScoreAsync();
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}