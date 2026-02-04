/**
 * OrgDashboard.tsx
 * 
 * Organization dashboard for event organizers featuring:
 * - Real-time revenue statistics from API
 * - Organization-specific metrics
 * - Quick action buttons for creating events/products
 * - Active events count
 * - Key performance metrics (tickets sold, products sold)
 * 
 * Central hub for organizations to manage their events and products
 */

import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Package, DollarSign, Users, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { analyticsApi, OrgRevenue, DashboardStats } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import OrgStatistics from "./org/OrgStatistics";

export default function OrgDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<OrgRevenue | null>(null);
  const [platformStats, setPlatformStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [revenue, dashboardStats] = await Promise.all([
          analyticsApi.getOrgRevenue(),
          analyticsApi.getDashboardStats()
        ]);

        // Find this organizer's organization data
        // Fallback to first org for now (user organization data not available in current API)
        const myOrg = revenue[0];

        setOrgData(myOrg);
        setPlatformStats(dashboardStats);

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Organization Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {orgData?.org_name || "Your Organization"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/events">
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/products">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.total_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All revenue sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.ticket_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Event ticket sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shop Revenue</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.shop_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Merchandise sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Store Revenue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                EGP {(orgData?.store_revenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Store product sales</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Overall platform metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Tickets Sold</p>
                  <p className="text-2xl font-bold">
                    {platformStats?.total_tickets_sold.toLocaleString() || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">Total Products Sold</p>
                  <p className="text-2xl font-bold">
                    {platformStats?.total_products_sold.toLocaleString() || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">Total Events</p>
                  <p className="text-2xl font-bold">
                    {platformStats?.total_events.toLocaleString() || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Events
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Embedded Statistics */}
        <div className="mt-8">
          <OrgStatistics />
        </div>
      </div>
    </div>
  );
}
