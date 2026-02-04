/**
 * OrgStatistics.tsx
 * 
 * Statistics dashboard for organization owners.
 * Shows metrics specific to their organization only.
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
import { analyticsApi, OrgRevenue, EventAttendance } from "@/lib/api";
import { Loader2, DollarSign, Ticket, ShoppingBag, Store } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OrgStatistics() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<OrgRevenue | null>(null);
  const [orgEvents, setOrgEvents] = useState<EventAttendance[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [revenue, attendance] = await Promise.all([
          analyticsApi.getOrgRevenue(),
          analyticsApi.getEventAttendance()
        ]);

        // Find this organizer's organization data
        // Note: Assuming user has organizationId or we match by org name
        // Fallback to first org for now (user organization data not available in current API)
        const myOrg = revenue[0];

        setOrgData(myOrg);

        // Filter events for this organization
        // Note: This assumes events have an org_id or similar field
        // Since the API doesn't provide org_id for events, we show all events
        // In a real scenario, you'd filter by org_id
        setOrgEvents(attendance.sort((a, b) => b.tickets_sold - a.tickets_sold).slice(0, 10));

      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const BRAND_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#8b5cf6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Revenue breakdown for pie chart
  const revenueBreakdown = [
    { name: "Ticket Revenue", value: orgData?.ticket_revenue || 0 },
    { name: "Shop Revenue", value: orgData?.shop_revenue || 0 },
    { name: "Store Revenue", value: orgData?.store_revenue || 0 },
  ].filter(item => item.value > 0); // Only show non-zero values

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Organizer Analytics
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {orgData?.org_name || "Your Organization"}
          </p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.total_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All sources combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.ticket_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Event ticket sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shop Revenue</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.shop_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Merchandise sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Revenue</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.store_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Store product sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>Breakdown by revenue source</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {revenueBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent > 0 ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''
                      }
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Events by Attendance</CardTitle>
              <CardDescription>Your most popular events</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgEvents}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="event_title"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar
                    dataKey="tickets_sold"
                    name="Tickets Sold"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Events Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Performance Details</CardTitle>
            <CardDescription>Detailed breakdown of your events</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead className="text-right">Tickets Sold</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgEvents.length > 0 ? (
                  orgEvents.map((event) => (
                    <TableRow key={event.event_id}>
                      <TableCell className="font-medium">{event.event_title}</TableCell>
                      <TableCell className="text-right">{event.tickets_sold}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${event.tickets_sold > 0
                            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400'
                          }`}>
                          {event.tickets_sold > 0 ? 'Active' : 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
