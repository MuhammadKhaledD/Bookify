/**
 * AdminStatistics.tsx
 * 
 * Comprehensive statistics dashboard for platform administrators.
 * Displays analytics across organizations, events, and users with interactive charts.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useEffect, useState } from "react";
import { analyticsApi, DashboardStats, OrgRevenue, EventAttendance, TopEvent, UserEngagement } from "@/lib/api";
import { Loader2, TrendingUp, Users, Building2, Calendar, Ticket, ShoppingBag, Trophy, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [orgRevenue, setOrgRevenue] = useState<OrgRevenue[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [eventAttendance, setEventAttendance] = useState<EventAttendance[]>([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stats, revenue, events, attendance, engagement] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getOrgRevenue(),
          analyticsApi.getTopEvents(),
          analyticsApi.getEventAttendance(),
          analyticsApi.getUserEngagement()
        ]);

        setDashboardStats(stats);
        setOrgRevenue(revenue.sort((a, b) => b.total_revenue - a.total_revenue));
        setTopEvents(events);
        setEventAttendance(attendance.sort((a, b) => b.tickets_sold - a.tickets_sold).slice(0, 15));
        setUserEngagement(engagement.sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 10));

      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Chart colors using CSS variables for theme consistency
  const BRAND_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#8b5cf6", "#ec4899", "#f59e0b"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate aggregate revenue breakdown
  const revenueBreakdown = [
    {
      name: "Ticket Revenue",
      value: orgRevenue.reduce((sum, org) => sum + org.ticket_revenue, 0),
    },
    {
      name: "Shop Revenue",
      value: orgRevenue.reduce((sum, org) => sum + org.shop_revenue, 0),
    },
    {
      name: "Store Revenue",
      value: orgRevenue.reduce((sum, org) => sum + org.store_revenue, 0),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Platform Analytics
          </span>
        </h1>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_organizations || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_events || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_tickets_sold || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_products_sold || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Event</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{dashboardStats?.top_event_title || "N/A"}</div>
              <p className="text-xs text-muted-foreground">{dashboardStats?.top_event_tickets_sold || 0} tickets</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Product</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{dashboardStats?.top_product_name || "N/A"}</div>
              <p className="text-xs text-muted-foreground">{dashboardStats?.top_product_sold || 0} sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Organization Revenue - SHOW ALL */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Organization Revenue Comparison</CardTitle>
              <CardDescription>All organizations ranked by total revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgRevenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="org_name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="ticket_revenue" name="Ticket Revenue" fill={BRAND_COLORS[0]} stackId="a" />
                  <Bar dataKey="shop_revenue" name="Shop Revenue" fill={BRAND_COLORS[1]} stackId="a" />
                  <Bar dataKey="store_revenue" name="Store Revenue" fill={BRAND_COLORS[2]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown Pie */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Revenue Sources</CardTitle>
              <CardDescription>Breakdown by revenue type</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    formatter={(value: number) => `EGP ${value.toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Events by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Events by Revenue</CardTitle>
              <CardDescription>Highest earning events</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="event_title"
                    type="category"
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    formatter={(value: number) => `EGP ${value}`}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill={BRAND_COLORS[3]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Event Attendance Leaderboard</CardTitle>
              <CardDescription>Top 15 events by tickets sold</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Event Title</TableHead>
                    <TableHead className="text-right">Tickets Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventAttendance.map((event, index) => (
                    <TableRow key={event.event_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{event.event_title}</TableCell>
                      <TableCell className="text-right">{event.tickets_sold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Engagement Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top User Engagement</CardTitle>
              <CardDescription>Most engaged platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userEngagement.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell className="text-right">{user.events_attended}</TableCell>
                      <TableCell className="text-right">{user.products_purchased}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {user.engagement_score.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
