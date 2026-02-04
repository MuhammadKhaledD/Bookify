namespace Bookify_Backend.Entities
{
    public class OrgEarningsDto
    {
        public int org_id { get; set; }
        public string org_name { get; set; } = string.Empty;
        public decimal total_earnings { get; set; }
    }

    public class EventAttendanceDto
    {
        public int event_id { get; set; }
        public string event_title { get; set; } = string.Empty;
        public int tickets_sold { get; set; }
    }

    public class UserActivityStatsDto
    {
        public long total_users { get; set; }
        public long active_users { get; set; }
    }

    public class UserPaymentDto
    {
        public string user_id { get; set; } = string.Empty;
        public string user_name { get; set; } = string.Empty;
        public decimal total_paid { get; set; }
    }

    public class TopEventRevenueDto
    {
        public int event_id { get; set; }
        public string event_title { get; set; } = string.Empty;
        public decimal revenue { get; set; }
    }

    public class UserLoyaltySummaryDto
    {
        public string user_id { get; set; } = string.Empty;
        public string user_name { get; set; } = string.Empty;
        public int total_orders { get; set; }
        public decimal total_spent { get; set; }
        public int loyalty_points { get; set; }
    }

    public class RefundableTicketsDto
    {
        public int event_id { get; set; }
        public string event_title { get; set; } = string.Empty;
        public int refundable_tickets { get; set; }
    }

    public class OrgRevenueBreakdownDto
    {
        public int org_id { get; set; }
        public string org_name { get; set; } = string.Empty;
        public decimal ticket_revenue { get; set; }
        public decimal shop_revenue { get; set; }
        public decimal store_revenue { get; set; }
        public decimal total_revenue { get; set; }
    }

    public class UserEngagementScoreDto
    {
        public string user_id { get; set; } = string.Empty;
        public string user_name { get; set; } = string.Empty;
        public int events_attended { get; set; }
        public int products_purchased { get; set; }
        public int reviews_written { get; set; }
        public int loyalty_points { get; set; }
        public decimal engagement_score { get; set; }
    }

    public class DashboardStatsDto
    {
        public int total_organizations { get; set; }
        public long total_admins { get; set; }
        public long total_organizers { get; set; }
        public long total_users { get; set; }
        public int total_events { get; set; }
        public long total_tickets_sold { get; set; }
        public long total_products_sold { get; set; }
        public int? top_product_id { get; set; }
        public string? top_product_name { get; set; }
        public int? top_product_sold { get; set; }
        public int? top_event_id { get; set; }
        public string? top_event_title { get; set; }
        public int? top_event_tickets_sold { get; set; }
    }
}