using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services
{
    /// <summary>
    /// Analytics service for business logic
    /// </summary>
    public class AnalyticsService
    {
        private readonly IAnalyticsRepository _analyticsRepo;

        public AnalyticsService(IAnalyticsRepository analyticsRepo)
        {
            _analyticsRepo = analyticsRepo;
        }

        public async Task<List<OrgEarningsDto>> GetOrgEarningsAsync()
        {
            return await _analyticsRepo.GetOrgEarningsAsync();
        }

        public async Task<List<EventAttendanceDto>> GetEventAttendanceAsync()
        {
            return await _analyticsRepo.GetEventAttendanceAsync();
        }

        public async Task<UserActivityStatsDto> GetUserActivityStatsAsync()
        {
            return await _analyticsRepo.GetUserActivityStatsAsync();
        }

        public async Task<List<UserPaymentDto>> GetUserPaymentsAsync()
        {
            return await _analyticsRepo.GetUserPaymentsAsync();
        }

        public async Task<List<TopEventRevenueDto>> GetTopEventsByRevenueAsync()
        {
            return await _analyticsRepo.GetTopEventsByRevenueAsync();
        }

        public async Task<List<UserLoyaltySummaryDto>> GetUserLoyaltySummaryAsync()
        {
            return await _analyticsRepo.GetUserLoyaltySummaryAsync();
        }

        public async Task<List<RefundableTicketsDto>> GetRefundableTicketsAsync()
        {
            return await _analyticsRepo.GetRefundableTicketsAsync();
        }

        public async Task<List<OrgRevenueBreakdownDto>> GetOrgRevenueBreakdownAsync()
        {
            return await _analyticsRepo.GetOrgRevenueBreakdownAsync();
        }

        public async Task<List<UserEngagementScoreDto>> GetUserEngagementScoreAsync()
        {
            return await _analyticsRepo.GetUserEngagementScoreAsync();
        }
        
        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            return await _analyticsRepo.GetDashboardStatsAsync();
        }
    }
}