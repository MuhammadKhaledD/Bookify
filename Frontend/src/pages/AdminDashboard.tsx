/**
 * AdminDashboard.tsx
 * 
 * Administrator control panel featuring:
 * - Platform-wide statistics from analytics API
 * - User, organization, event counts
 * - Platform revenue tracking
 * - Quick navigation to admin management sections
 * 
 * Central command center for platform administrators
 */

import { Link } from "react-router-dom";
import { Users, Building2, Calendar, DollarSign, TrendingUp, Shield, Tag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { analyticsApi, DashboardStats } from "@/lib/api";
import { Loader2 } from "lucide-react";
import AdminStatistics from "./admin/AdminStatistics";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await analyticsApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Platform-wide users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_organizations.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active organizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_events.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Platform events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tickets_sold.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time ticket sales</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Key platform metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Products Sold</p>
                  <p className="text-2xl font-bold">{stats?.total_products_sold.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">Top Event</p>
                  <p className="font-medium">{stats?.top_event_title || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{stats?.top_event_tickets_sold || 0} tickets</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">Top Product</p>
                  <p className="font-medium">{stats?.top_product_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{stats?.top_product_sold || 0} sold</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Management Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Management</CardTitle>
              <CardDescription>Administration tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/organizations">
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Organizations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/rewards">
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Rewards
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/categories">
                  <Tag className="mr-2 h-4 w-4" />
                  Manage Categories
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Verification
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Embedded Statistics */}
        <div className="mt-8">
          <AdminStatistics />
        </div>
      </div>
    </div>
  );
}
