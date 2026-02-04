import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { eventsApi, categoriesApi, organizationApi, ticketsApi } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Event {
    id?: number;
    title: string;
    description?: string;
    eventDate: string;
    locationName: string;
    locationAddress?: string;
    imageUrl: string;
    categoryId?: number;
    organizationId?: number;
    status: string;
    capacity?: number;
    ageRestriction?: number;
}

interface Ticket {
    id?: number;
    ticketType: string;
    price: number;
    quantityAvailable: number;
    limitPerUser: number;
    discount: number;
    isRefundable: boolean;
    pointsEarnedPerUnit: number;
    seatsDescription: string;
}

interface Category {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

interface EventFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event?: Event | null;
    onSuccess: () => void;
    organizationId?: number; // Optional prop if we want to lock creation to a specific org
}

export function EventFormDialog({
    open,
    onOpenChange,
    event,
    onSuccess,
    organizationId,
}: EventFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const isEdit = !!event;

    const form = useForm<Event>({
        defaultValues: {
            title: "",
            description: "",
            eventDate: "",
            locationName: "",
            locationAddress: "",
            imageUrl: "",
            categoryId: 0,
            organizationId: organizationId || 0,
            status: "Active", // Default status
            capacity: 0,
            ageRestriction: 0,
        },
    });

    // Fetch categories and organizations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, orgsData] = await Promise.all([
                    categoriesApi.getAll(),
                    organizationId ? Promise.resolve([]) : organizationApi.getAll(),
                ]);
                setCategories(categoriesData || []);
                if (!organizationId) {
                    setOrganizations(orgsData || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load categories or organizations.",
                    variant: "destructive",
                });
            }
        };
        if (open) {
            fetchData();
        }
    }, [open, organizationId]);

    // Reset form when event changes
    useEffect(() => {
        console.log("📝 Event changed:", event);
        console.log("📦 Available categories:", categories);
        console.log("🏢 Available organizations:", organizations);
        if (event) {
            form.reset({
                title: event.title,
                description: event.description || "",
                eventDate: event.eventDate ? event.eventDate.split("T")[0] : "",
                locationName: event.locationName,
                locationAddress: event.locationAddress || "",
                imageUrl: event.imageUrl,
                categoryId: event.categoryId || 0,
                organizationId: event.organizationId || 0,
                status: event.status || "Active",
                capacity: event.capacity || 0,
                ageRestriction: event.ageRestriction || 0,
            });
            setImageFile(null);

            // Fetch existing tickets for this event
            if (event.id) {
                ticketsApi.getByEventId(event.id).then((ticketsData) => {
                    setTickets(ticketsData || []);
                }).catch((error) => {
                    console.error("Failed to fetch tickets:", error);
                    setTickets([]);
                });
            }
        } else {
            form.reset({
                title: "",
                description: "",
                eventDate: "",
                locationName: "",
                locationAddress: "",
                imageUrl: "",
                categoryId: 0,
                organizationId: organizationId || 0,
                status: "Active",
                capacity: 0,
                ageRestriction: 0,
            });
            setImageFile(null);
            // Initialize with one empty ticket for new events
            setTickets([{
                ticketType: "",
                price: 0,
                quantityAvailable: 0,
                limitPerUser: 1,
                discount: 0,
                isRefundable: true,
                pointsEarnedPerUnit: 0,
                seatsDescription: "",
            }]);
        }
    }, [event, form, organizationId, open]);

    const onSubmit = async (data: Event) => {
        setLoading(true);
        try {
            let eventId = event?.id;

            if (isEdit && event?.id) {
                // UPDATE (PUT) - Send FormData (backend expects [FromForm])
                // Note: organizationId and categoryId CANNOT be changed after creation
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("description", data.description || "");
                formData.append("eventDate", new Date(data.eventDate).toISOString());
                formData.append("locationName", data.locationName);
                formData.append("locationAddress", data.locationAddress || "");
                formData.append("status", data.status);
                formData.append("capacity", String(data.capacity));
                formData.append("ageRestriction", String(data.ageRestriction));

                if (imageFile) {
                    formData.append("imageUrl", imageFile);
                } else {
                    formData.append("imageUrl", data.imageUrl || "");
                }

                await eventsApi.update(event.id, formData);

                // Update tickets
                await Promise.all(tickets.map(async (ticket) => {
                    if (ticket.id) {
                        // Update existing ticket
                        await ticketsApi.update(ticket.id, {
                            ticketType: ticket.ticketType,
                            price: Number(ticket.price),
                            quantityAvailable: Number(ticket.quantityAvailable),
                            limitPerUser: Number(ticket.limitPerUser),
                            discount: Number(ticket.discount),
                            isRefundable: ticket.isRefundable,
                            pointsEarnedPerUnit: Number(ticket.pointsEarnedPerUnit),
                            seatsDescription: ticket.seatsDescription,
                        });
                    } else if (ticket.ticketType) {
                        // Create new ticket for this event
                        await ticketsApi.create({
                            eventId: event.id!,
                            ticketType: ticket.ticketType,
                            price: Number(ticket.price),
                            quantityAvailable: Number(ticket.quantityAvailable),
                            limitPerUser: Number(ticket.limitPerUser),
                            discount: Number(ticket.discount),
                            isRefundable: ticket.isRefundable,
                            pointsEarnedPerUnit: Number(ticket.pointsEarnedPerUnit),
                            seatsDescription: ticket.seatsDescription,
                        });
                    }
                }));

                toast({
                    title: "Event updated",
                    description: "The event and tickets have been updated successfully.",
                });
            } else {
                // CREATE (POST) - Send FormData for Image Upload support
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("description", data.description || "");
                formData.append("eventDate", new Date(data.eventDate).toISOString());
                formData.append("locationName", data.locationName);
                formData.append("locationAddress", data.locationAddress || "");
                formData.append("categoryId", String(data.categoryId));
                formData.append("orgId", String(data.organizationId));
                formData.append("capacity", String(data.capacity));
                formData.append("ageRestriction", String(data.ageRestriction));

                if (imageFile) {
                    formData.append("EventImageFile", imageFile);
                }

                const createdEvent = await eventsApi.create(formData);
                eventId = createdEvent.id;

                // Create tickets for the new event
                await Promise.all(tickets.filter(t => t.ticketType).map(async (ticket) => {
                    await ticketsApi.create({
                        eventId: eventId!,
                        ticketType: ticket.ticketType,
                        price: Number(ticket.price),
                        quantityAvailable: Number(ticket.quantityAvailable),
                        limitPerUser: Number(ticket.limitPerUser),
                        discount: Number(ticket.discount),
                        isRefundable: ticket.isRefundable,
                        pointsEarnedPerUnit: Number(ticket.pointsEarnedPerUnit),
                        seatsDescription: ticket.seatsDescription,
                    });
                }));

                toast({
                    title: "Event created",
                    description: "The event and tickets have been created successfully.",
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message ||
                `Failed to ${isEdit ? "update" : "create"} event.`;
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTicket = () => {
        setTickets([...tickets, {
            ticketType: "",
            price: 0,
            quantityAvailable: 0,
            limitPerUser: 1,
            discount: 0,
            isRefundable: true,
            pointsEarnedPerUnit: 0,
            seatsDescription: "",
        }]);
    };

    const handleRemoveTicket = (index: number) => {
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const handleTicketChange = (index: number, field: keyof Ticket, value: any) => {
        const newTickets = [...tickets];
        newTickets[index] = { ...newTickets[index], [field]: value };
        setTickets(newTickets);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the event details below."
                            : "Fill in the details to create a new event."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                rules={isEdit ? {} : { required: "Title is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Summer Music Festival" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                rules={isEdit ? {} : { required: "Category is required", min: { value: 1, message: "Select a category" } }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value ? String(field.value) : ""}
                                            disabled={isEdit}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isEdit && <FormDescription>Category cannot be changed</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            rules={isEdit ? {} : { required: "Description is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the event..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="eventDate"
                                rules={isEdit ? {} : { required: "Date is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!organizationId && (
                                <FormField
                                    control={form.control}
                                    name="organizationId"
                                    rules={isEdit ? {} : { required: "Organization is required", min: { value: 1, message: "Select an organization" } }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organization *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value ? String(field.value) : ""}
                                                disabled={isEdit}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select organization" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {organizations.map((org) => (
                                                        <SelectItem key={org.id} value={String(org.id)}>
                                                            {org.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isEdit && <FormDescription>Organization cannot be changed</FormDescription>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="locationName"
                                rules={isEdit ? {} : { required: "Location name is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Cairo Stadium" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="locationAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                rules={isEdit ? {} : { required: "Capacity is required", min: 1 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity *</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ageRestriction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="18" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                                <SelectItem value="Ended">Ended</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Event Image</Label>
                            <ImageUpload
                                onImageSelect={setImageFile}
                            />
                            <p className="text-sm text-muted-foreground">Upload an event image (optional)</p>
                        </div>

                        <Separator className="my-6" />

                        {/* Tickets Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Label className="text-lg font-semibold">Event Tickets</Label>
                                    <p className="text-sm text-muted-foreground">Add different ticket types with pricing</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddTicket}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Add Ticket
                                </Button>
                            </div>

                            {tickets.map((ticket, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                                    {tickets.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveTicket(index)}
                                            className="absolute top-2 right-2 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Ticket Type *</Label>
                                            <Input
                                                value={ticket.ticketType}
                                                onChange={(e) => handleTicketChange(index, "ticketType", e.target.value)}
                                                placeholder="e.g., VIP, Regular, Student"
                                            />
                                        </div>
                                        <div>
                                            <Label>Price (EG P) *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={ticket.price}
                                                onChange={(e) => handleTicketChange(index, "price", Math.max(0, Number(e.target.value)))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Quantity Available *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={ticket.quantityAvailable}
                                                onChange={(e) => handleTicketChange(index, "quantityAvailable", Math.max(0, Number(e.target.value)))}
                                                placeholder="100"
                                            />
                                        </div>
                                        <div>
                                            <Label>Limit Per User</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={ticket.limitPerUser}
                                                onChange={(e) => handleTicketChange(index, "limitPerUser", Math.max(1, Number(e.target.value)))}
                                                placeholder="1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Discount (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={ticket.discount}
                                                onChange={(e) => handleTicketChange(index, "discount", Math.min(100, Math.max(0, Number(e.target.value))))}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Points Per Unit</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={ticket.pointsEarnedPerUnit}
                                                onChange={(e) => handleTicketChange(index, "pointsEarnedPerUnit", Math.max(0, Number(e.target.value)))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 pt-6">
                                            <Checkbox
                                                id={`refundable-${index}`}
                                                checked={ticket.isRefundable}
                                                onCheckedChange={(checked) => handleTicketChange(index, "isRefundable", checked)}
                                            />
                                            <label
                                                htmlFor={`refundable-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Refundable
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Seats Description (Optional)</Label>
                                        <Textarea
                                            value={ticket.seatsDescription}
                                            onChange={(e) => handleTicketChange(index, "seatsDescription", e.target.value)}
                                            placeholder="e.g., Front row, Balcony section..."
                                            className="min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form >
            </DialogContent >
        </Dialog >
    );
}
