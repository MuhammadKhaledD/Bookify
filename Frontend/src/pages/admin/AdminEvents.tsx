import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Search, Edit, Trash2, Plus, Calendar } from "lucide-react";
import { eventsApi, organizationApi } from "@/lib/api";
import { EventFormDialog } from "@/components/EventFormDialog";
import { ShopFormDialog } from "@/components/ShopFormDialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";

interface Event {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    locationName: string;
    imageUrl: string;
    categoryId?: number;
    categoryName?: string;
    organizationId?: number;
    organizationName?: string;
    minPrice: number;
    status: string;
    ageRestriction?: number;
    capacity?: number;
    locationAddress?: string;
}

interface Organization {
    id: number;
    name: string;
}

export default function AdminEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
    const [organizerOrgIds, setOrganizerOrgIds] = useState<number[]>([]);
    const [orgsFetched, setOrgsFetched] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [shopDialogOpen, setShopDialogOpen] = useState(false);
    const [selectedEventForShop, setSelectedEventForShop] = useState<number | null>(null);
    const { user } = useAppSelector((state) => state.auth);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await eventsApi.getAll();
            console.log("Fetched all events:", data.length);

            // Show ALL events - no automatic filtering
            setEvents(data);

            // Get unique organizations from events for filter dropdown
            const uniqueOrgs = Array.from(new Set(data.map((e: any) => e.organizationName).filter(Boolean)))
                .map(name => ({ id: 0, name })); // id not needed for filtering
            setAllOrganizations(uniqueOrgs as any);
            console.log("Available organizations in events:", uniqueOrgs);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            toast({
                title: "Error",
                description: "Failed to load events.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOrganizerOrganizations = async () => {
        try {
            const response = await api.get("/OrganizationOrganizers/organizerOrgnizations");
            // Backend returns { data: organizations }, so we need response.data.data
            const orgs = response.data?.data || [];
            const orgIds = orgs.map((org: any) => org.id);
            setOrganizerOrgIds(orgIds);
            setOrganizations(orgs);
            console.log("===== ORGANIZER ORGANIZATIONS DEBUG (Events) =====");
            console.log("Organizer's organizations:", orgs);
            console.log("Organization IDs:", orgIds);
            console.log("Organization Names:", orgs.map((o: any) => o.name));
            console.log("====================================================");
        } catch (error) {
            console.error("Failed to fetch organizer organizations:", error);
        } finally {
            setOrgsFetched(true);
        }
    };



    useEffect(() => {
        fetchOrganizerOrganizations();
    }, []);

    // Auto-select organizer's organization when both datasets are loaded
    useEffect(() => {
        if (organizations.length > 0 && allOrganizations.length > 0 && selectedOrgId === null) {
            // Find organizer's org in the all organizations list
            const organizerOrgName = organizations[0]?.name;
            const matchingOrgIndex = allOrganizations.findIndex(org => org.name === organizerOrgName);
            if (matchingOrgIndex !== -1) {
                setSelectedOrgId(matchingOrgIndex);
                console.log(`Auto-selected organizer's organization: ${organizerOrgName}`);
            }
        }
    }, [organizations, allOrganizations]);

    // Fetch events after organizerOrgIds is set
    useEffect(() => {
        if (!orgsFetched) {
            // Wait for organizations to be fetched
            return;
        }
        fetchEvents();
    }, [orgsFetched]);

    // Search and organization filter
    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        // Filter by selected org name (selectedOrgId is the index in allOrganizations array)
        const matchesOrg = selectedOrgId === null || event.organizationName === allOrganizations[selectedOrgId]?.name;
        return matchesSearch && matchesOrg;
    });

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                await eventsApi.delete(id);
                toast({
                    title: "Event deleted",
                    description: "The event has been deleted successfully.",
                });
                fetchEvents();
            } catch (error: any) {
                console.error("Failed to delete event:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete event.";
                toast({
                    title: "Delete Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = async (event: Event) => {
        try {
            // Fetch complete event data from database
            const fullEventData = await eventsApi.getById(event.id);
            console.log("📝 Full event data fetched:", fullEventData);
            setEditingEvent(fullEventData);
            setCreateDialogOpen(true);
        } catch (error) {
            console.error("Failed to fetch event details:", error);
            toast({
                title: "Error",
                description: "Failed to load event details",
                variant: "destructive",
            });
        }
    };

    const handleCreateOpen = () => {
        setEditingEvent(null);
        setCreateDialogOpen(true);
    };

    const handleCreateShop = (eventId: number) => {
        setSelectedEventForShop(eventId);
        setShopDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Event Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage and monitor all platform events</p>
                    </div>
                    <Button
                        onClick={handleCreateOpen}
                        className="gap-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Add Event
                    </Button>
                </div>

                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <CardTitle>Events</CardTitle>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedOrgId?.toString() || "all"}
                                    onValueChange={(value) => setSelectedOrgId(value === "all" ? null : parseInt(value))}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Organizations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Organizations</SelectItem>
                                        {allOrganizations.map((org, idx) => (
                                            <SelectItem key={idx} value={idx.toString()}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search events..."
                                        className="pl-9 w-[250px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Price (EGP)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No events found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-semibold flex items-center gap-3">
                                                {event.imageUrl ? (
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span>{event.title}</span>
                                            </TableCell>
                                            <TableCell>{event.categoryName || 'N/A'}</TableCell>
                                            <TableCell>{event.locationName}</TableCell>
                                            <TableCell>{event.organizationName || 'N/A'}</TableCell>
                                            <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {event.minPrice ? `EGP ${event.minPrice}` : 'Free'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={event.status === 'Active' ? 'default' : 'secondary'}>
                                                    {event.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(event)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCreateShop(event.id)}>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Create Shop
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(event.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <EventFormDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    event={editingEvent}
                    onSuccess={fetchEvents}
                    organizationId={organizerOrgIds.length > 0 ? organizerOrgIds[0] : undefined}
                />

                <ShopFormDialog
                    open={shopDialogOpen}
                    onOpenChange={setShopDialogOpen}
                    eventId={selectedEventForShop}
                    onSuccess={() => {
                        toast({
                            title: "Success",
                            description: "Shop created successfully",
                        });
                    }}
                />
            </div>
        </div>
    );
}
