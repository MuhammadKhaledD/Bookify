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
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { rewardsApi, fetchProducts, fetchTickets } from "@/lib/api";

interface Reward {
    id?: number;
    name: string;
    description?: string;
    pointsRequired: number;
    rewardType: string;
    discount?: number;
    expireDate: string;
    status: boolean;
    itemProductId?: number | null;
    itemTicketId?: number | null;
}

interface RewardFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reward?: Reward | null;
    onSuccess: () => void;
}

interface Product {
    id: number;
    name: string;
}

interface Ticket {
    id: number;
    ticketType: string;
    eventId?: number;
    eventTitle?: string;
}

export function RewardFormDialog({
    open,
    onOpenChange,
    reward,
    onSuccess,
}: RewardFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const isEdit = !!reward;

    const form = useForm<Reward>({
        defaultValues: {
            name: "",
            description: "",
            pointsRequired: 0,
            rewardType: "",
            discount: 0,
            expireDate: "",
            status: true,
            itemProductId: null,
            itemTicketId: null,
        },
    });

    // Watch for changes in product/ticket selection
    const selectedProductId = form.watch("itemProductId");
    const selectedTicketId = form.watch("itemTicketId");

    // Fetch products and tickets
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                const [productsData, ticketsData] = await Promise.all([
                    fetchProducts(),
                    fetchTickets()
                ]);
                setProducts(productsData);
                setTickets(ticketsData);
            } catch (error) {
                console.error("Failed to load products/tickets:", error);
                toast({
                    title: "Warning",
                    description: "Failed to load products and tickets.",
                    variant: "destructive",
                });
            } finally {
                setLoadingData(false);
            }
        };

        if (open) {
            loadData();
        }
    }, [open]);

    useEffect(() => {
        if (reward) {
            form.reset({
                name: reward.name,
                description: reward.description || "",
                pointsRequired: reward.pointsRequired,
                rewardType: reward.rewardType,
                discount: reward.discount || 0,
                expireDate: reward.expireDate ? reward.expireDate.split("T")[0] : "",
                status: reward.status,
                itemProductId: reward.itemProductId || null,
                itemTicketId: reward.itemTicketId || null,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                pointsRequired: 0,
                rewardType: "",
                discount: 0,
                expireDate: "",
                status: true,
                itemProductId: null,
                itemTicketId: null,
            });
        }
    }, [reward, form, open]);

    const onSubmit = async (data: Reward) => {
        setLoading(true);
        try {
            // Sanitize data - convert empty strings to undefined for optional fields
            const sanitizedData = {
                name: data.name,
                description: data.description?.trim() || undefined,
                pointsRequired: Number(data.pointsRequired),
                rewardType: data.rewardType,
                discount: data.discount ? Number(data.discount) : 0,
                expireDate: new Date(data.expireDate).toISOString(),
                status: data.status,
                itemProductId: data.itemProductId || null,
                itemTicketId: data.itemTicketId || null,
            };

            console.log("Submitting reward data:", sanitizedData);

            if (isEdit && reward?.id) {
                const result = await rewardsApi.update(reward.id, sanitizedData);
                console.log("Update response:", result);
                toast({
                    title: "Reward updated",
                    description: "The reward has been updated successfully.",
                });
            } else {
                const result = await rewardsApi.create(sanitizedData);
                console.log("Create response:", result);
                toast({
                    title: "Reward created",
                    description: "The reward has been created successfully.",
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Full error object:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.title ||
                error.message ||
                `Failed to ${isEdit ? "update" : "create"} reward.`;
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Reward" : "Add Reward"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the reward details below."
                            : "Enter the details for the new reward."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Free Coffee Voucher" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Reward description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pointsRequired"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points Required</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rewardType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reward Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Voucher" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expireDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        value={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Select either a product OR a ticket (optional)
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="itemProductId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reward Product</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value === "none" ? null : parseInt(value));
                                                    if (value !== "none") {
                                                        form.setValue("itemTicketId", null);
                                                    }
                                                }}
                                                value={field.value ? String(field.value) : "none"}
                                                disabled={!!selectedTicketId || loadingData}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={String(product.id)}>
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {selectedTicketId ? "Disabled (ticket selected)" : "Optional"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="itemTicketId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reward Ticket</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value === "none" ? null : parseInt(value));
                                                    if (value !== "none") {
                                                        form.setValue("itemProductId", null);
                                                    }
                                                }}
                                                value={field.value ? String(field.value) : "none"}
                                                disabled={!!selectedProductId || loadingData}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a ticket" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {tickets.map((ticket) => (
                                                        <SelectItem key={ticket.id} value={String(ticket.id)}>
                                                            {ticket.eventTitle ? `${ticket.eventTitle} - ${ticket.ticketType}` : ticket.ticketType}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {selectedProductId ? "Disabled (product selected)" : "Optional"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                            <Button type="submit" disabled={loading || loadingData}>
                                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

