/**
 * Events.tsx
 *
 * Events listing page with comprehensive filtering and search:
 * - Search functionality for finding events by name
 * - Organization filtering
 * - Pagination (6 events per page)
 * - Responsive grid layout for event cards
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Calendar,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { EventFormDialog } from "@/components/EventFormDialog";
import api from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { canAccessOrganizer } from "@/utils/roles";
import { toast } from "@/hooks/use-toast";

type Event = {
  id: number;
  title: string;
  imageUrl: string;
  status: string;
  eventDate: string;
  locationName: string;
  categoryName?: string;
  organizationName?: string;
  organizationId?: number;
  minPrice?: number | null;
  minPoints?: number | null;  // Minimum points earned from tickets
  description?: string;
  categoryId?: number;
};

type Organization = {
  id: number;
  name: string;
};

type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
};

const Events = () => {
  const { roles, user } = useAppSelector((state) => state.auth);
  const showOrganizerControls = canAccessOrganizer(roles);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Organizer CRUD states
  const [formOpen, setformOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [userOrgId, setUserOrgId] = useState<number | null>(null);

  // Fetch events and organizations from backend API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventsRes, organizationsRes] = await Promise.all([
          api.get<Event[]>("/Events").catch((err) => {
            console.error("Error fetching events:", err);
            throw err;
          }),
          api.get<Organization[]>("/organizations").catch((err) => {
            console.error("Error fetching organizations:", err);
            // Don't fail completely if organizations fail
            return { data: [] };
          }),
        ]);

        setEvents(eventsRes.data || []);
        setOrganizations(organizationsRes.data || []);
      } catch (err) {
        const error = err as {
          response?: { data?: { message?: string }; status?: number };
          message?: string;
          config?: { url?: string };
        };
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load events. Please try again later.";
        setError(errorMessage);
        console.error("Error fetching data:", err);
        console.error("Error details:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          url: error?.config?.url,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get user's organization ID if organizer
  useEffect(() => {
    const fetchUserOrg = async () => {
      if (showOrganizerControls && user) {
        try {
          const response = await api.get("/auth/me");
          // Assuming the user object has orgId or organizationId
          setUserOrgId(response.data.orgId || response.data.organizationId || null);
        } catch (error) {
          console.error("Failed to fetch user org:", error);
        }
      }
    };
    fetchUserOrg();
  }, [showOrganizerControls, user]);

  const filteredEvents = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        (event.categoryName ?? "").toLowerCase().includes(search) ||
        (event.locationName ?? "").toLowerCase().includes(search);

      const selectedOrgName =
        selectedOrg === "all"
          ? null
          : organizations.find((o) => String(o.id) === selectedOrg)?.name;
      const matchesOrg =
        selectedOrg === "all" ||
        (selectedOrgName &&
          event.organizationName?.toLowerCase() ===
          selectedOrgName.toLowerCase());

      return matchesSearch && matchesOrg;
    });
  }, [events, organizations, searchQuery, selectedOrg]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredEvents.slice(start, end);
  }, [currentPage, filteredEvents, pagination.pageSize]);

  useEffect(() => {
    const totalItems = filteredEvents.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages),
    }));
  }, [filteredEvents, pagination.pageSize]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrg]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleOrgChange = (value: string) => {
    setSelectedOrg(value);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: {
        label: "Active",
        className: "bg-primary text-primary-foreground",
      },
      "sold out": {
        label: "Sold Out",
        className: "bg-destructive text-destructive-foreground",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-muted text-muted-foreground",
      },
    };
    const config = statusConfig[statusLower] || statusConfig["active"];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price?: number | null) => {
    // Events don't have direct prices - tickets do
    // So we show "View tickets" instead of a price
    return "View tickets";
  };

  // Organizer: Check if event belongs to organizer's org
  const canManageEvent = (event: Event): boolean => {
    if (!showOrganizerControls || !userOrgId) return false;
    return event.organizationId === userOrgId;
  };

  // Organizer: Open create dialog
  const handleCreate = () => {
    setEditingEvent(null);
    setformOpen(true);
  };

  // Organizer: Open edit dialog
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setformOpen(true);
  };

  // Organizer: Open delete confirmation
  const handleDeleteClick = (event: Event) => {
    setDeletingEvent(event);
    setDeleteDialogOpen(true);
  };

  // Organizer: Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;

    try {
      await api.delete(`/Events/${deletingEvent.id}`);
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      // Refresh events list
      const response = await api.get<Event[]>("/Events");
      setEvents(response.data || []);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete event.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingEvent(null);
    }
  };

  // Refresh events after CRUD operations
  const refreshEvents = async () => {
    try {
      const response = await api.get<Event[]>("/Events");
      setEvents(response.data || []);
    } catch (err) {
      console.error("Failed to refresh events:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Discover Events
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find and book tickets to the best events in Egypt
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-16 z-40 bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by title..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Organization Filter */}
            <Select value={selectedOrg} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-full md:w-64">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {paginatedEvents.length} of {filteredEvents.length}{" "}
                  events
                </p>
              </div>

              {/* Events Grid */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {paginatedEvents.map((event) => (
                    <div key={event.id} className="relative group">
                      <EventCard
                        id={String(event.id)}
                        title={event.title}
                        date={formatDate(event.eventDate)}
                        location={event.locationName}
                        price={formatPrice(event.minPrice)}
                        image={event.imageUrl}
                        category={event.categoryName || "Event"}
                        featured={event.status === "active"}
                        points={event.minPoints}
                      />
                      {showOrganizerControls && canManageEvent(event) && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteClick(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No events found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedOrg("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Organizer Dialogs */}
      {showOrganizerControls && (
        <>
          <EventFormDialog
            open={formOpen}
            onOpenChange={setformOpen}
            event={editingEvent}
            onSuccess={refreshEvents}
            organizationId={userOrgId || undefined}
          />
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingEvent?.title}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default Events;
