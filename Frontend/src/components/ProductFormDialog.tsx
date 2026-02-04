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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { productsApi } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";

interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    shopId?: number | null;
    storeId?: number | null;
    limitPerUser?: number;
    discount?: number;
    pointsEarnedPerUnit?: number;
    productImage?: string;
}

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSuccess: () => void;
    organizerOrgIds?: number[]; // Organization IDs for filtering shops/stores
}

interface Shop {
    id: number;
    name: string;
    eventId?: number;
}

interface Store {
    id: number;
    name: string;
    orgId?: number;
}

interface Event {
    id: number;
    title: string;
    organizationId: number;
}

interface ProductFormData extends Product {
    eventId?: number | null;
}

export function ProductFormDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
    organizerOrgIds = [],
}: ProductFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const isEdit = !!product;

    const form = useForm<Product>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stockQuantity: 0,
            shopId: null,
            storeId: null,
            limitPerUser: 0,
            discount: 0,
            pointsEarnedPerUnit: 0,
            productImage: "",
        },
    });

    // Watch shop/store selection
    const selectedShopId = form.watch("shopId");
    const selectedStoreId = form.watch("storeId");

    // Fetch events with shops when dialog opens
    useEffect(() => {
        const loadEventsWithShops = async () => {
            if (!open || isEdit) return;

            setLoadingData(true);
            try {
                // Fetch all events
                const response = await fetch(
                    'https://bookifyapi-ebdzebe4cxbbexga.germanywestcentral-01.azurewebsites.net/api/Events',
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
                        },
                    }
                );

                if (response.ok) {
                    const eventsData = await response.json();

                    // Fetch shop for each event
                    const eventsWithShops = await Promise.all(
                        eventsData.map(async (event: any) => {
                            try {
                                const shopResponse = await fetch(
                                    `https://bookifyapi-ebdzebe4cxbbexga.germanywestcentral-01.azurewebsites.net/api/shops/event/${event.id}`,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
                                        },
                                    }
                                );

                                // Only try to parse JSON if we got a 200 response with content
                                // 204 No Content means the event doesn't have a shop yet
                                if (shopResponse.status === 200) {
                                    const shop = await shopResponse.json();
                                    return { ...event, shop };
                                } else if (shopResponse.status === 204) {
                                    // Event exists but has no shop yet - return event without shop
                                    console.log(`Event ${event.id} (${event.title}) has no shop yet`);
                                    return { ...event, shop: null };
                                }
                            } catch (error) {
                                console.error(`Failed to fetch shop for event ${event.id}:`, error);
                            }
                            // On error, return event without shop
                            return { ...event, shop: null };
                        })
                    );

                    // Show ALL events, filter only by organizerOrgIds if provided
                    // We no longer require events to have shops
                    const filteredEvents = eventsWithShops.filter(e => {
                        const matchesOrg = organizerOrgIds.length === 0 || organizerOrgIds.includes(e.organizationId);
                        return matchesOrg;
                    });

                    console.log(`✅ Loaded ${filteredEvents.length} events (${filteredEvents.filter(e => e.shop).length} with shops)`);
                    setEvents(filteredEvents);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error("Failed to load events:", error);
                setEvents([]);
            } finally {
                setLoadingData(false);
            }
        };

        loadEventsWithShops();
    }, [open, isEdit, organizerOrgIds]);

    // Fetch stores from organization
    useEffect(() => {

        const loadStores = async () => {
            // Only load stores if dialog is open, not editing, and we have valid organizerOrgIds
            if (!open || isEdit || !organizerOrgIds || organizerOrgIds.length === 0) {
                setStores([]);
                return;
            }

            try {
                // Fetch stores for each organization, filtering out any undefined/null values
                const validOrgIds = organizerOrgIds.filter(id => id !== undefined && id !== null);

                if (validOrgIds.length === 0) {
                    setStores([]);
                    return;
                }

                const allStores = await Promise.all(
                    validOrgIds.map(async (orgId) => {
                        try {
                            const response = await fetch(
                                `https://bookifyapi-ebdzebe4cxbbexga.germanywestcentral-01.azurewebsites.net/api/stores/by-org/${orgId}`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
                                    },
                                }
                            );

                            if (response.ok) {
                                return await response.json();
                            }
                        } catch (error) {
                            console.error(`Failed to fetch store for org ${orgId}:`, error);
                        }
                        return null;
                    })
                );

                setStores(allStores.filter(s => s !== null));
            } catch (error) {
                console.error("Failed to load stores:", error);
                setStores([]);
            }
        };

        loadStores();
    }, [open, isEdit, organizerOrgIds]);

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                stockQuantity: product.stockQuantity,
                shopId: product.shopId || null,
                storeId: product.storeId || null,
                limitPerUser: product.limitPerUser || 0,
                discount: product.discount || 0,
                pointsEarnedPerUnit: product.pointsEarnedPerUnit || 0,
                productImage: product.productImage || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                price: 0,
                stockQuantity: 0,
                shopId: null,
                storeId: null,
                limitPerUser: 0,
                discount: 0,
                pointsEarnedPerUnit: 0,
                productImage: "",
            });
            setProductImageFile(null);
        }
    }, [product, form, open]);

    const onSubmit = async (data: Product) => {
        setLoading(true);
        try {
            if (isEdit && product?.id) {
                // For edit, use FormData (API expects multipart/form-data)
                const formDataToSend = new FormData();
                formDataToSend.append("Name", data.name);
                formDataToSend.append("Description", data.description);
                formDataToSend.append("Price", String(data.price));
                formDataToSend.append("StockQuantity", String(data.stockQuantity));

                if (data.limitPerUser) {
                    formDataToSend.append("LimitPerUser", String(data.limitPerUser));
                }
                if (data.discount) {
                    formDataToSend.append("Discount", String(data.discount));
                }
                if (data.pointsEarnedPerUnit) {
                    formDataToSend.append("PointsEarnedPerUnit", String(data.pointsEarnedPerUnit));
                }

                // If a new image file is selected, include it
                if (productImageFile) {
                    formDataToSend.append("ProductImage", productImageFile);
                }

                console.log("Updating product with FormData");
                const result = await productsApi.update(product.id, formDataToSend as any);
                console.log("Update response:", result);
                toast({
                    title: "Product updated",
                    description: "The product has been updated successfully.",
                });
            } else {
                // For create, use FormData to support file upload
                const formDataToSend = new FormData();
                formDataToSend.append("Name", data.name);
                formDataToSend.append("Description", data.description);
                formDataToSend.append("Price", String(data.price));
                formDataToSend.append("StockQuantity", String(data.stockQuantity));

                // Always include ShopId and StoreId (can be null)
                // They are mutually exclusive - only one should have a value
                if (data.shopId) {
                    formDataToSend.append("ShopId", String(data.shopId));
                } else if (data.storeId) {
                    formDataToSend.append("StoreId", String(data.storeId));
                }

                if (data.limitPerUser) {
                    formDataToSend.append("LimitPerUser", String(data.limitPerUser));
                }
                if (data.discount) {
                    formDataToSend.append("Discount", String(data.discount));
                }
                if (data.pointsEarnedPerUnit) {
                    formDataToSend.append("PointsEarnedPerUnit", String(data.pointsEarnedPerUnit));
                }
                if (productImageFile) {
                    formDataToSend.append("ProductImage", productImageFile);
                }

                console.log("Creating product with FormData");
                const result = await productsApi.create(formDataToSend as any);
                console.log("Create response:", result);
                toast({
                    title: "Product created",
                    description: "The product has been created successfully.",
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
                `Failed to ${isEdit ? "update" : "create"} product.`;
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the product details below."
                            : "Enter the details for the new product."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={isEdit ? {} : { required: "Product name is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Festival T-Shirt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            rules={isEdit ? {} : { required: "Description is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Product description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Shop Selection - Select from events */}
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="shopId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                const shopId = value && value !== "none" ? parseInt(value) : null;
                                                field.onChange(shopId);
                                                // Clear store selection when shop is selected
                                                if (shopId) {
                                                    form.setValue("storeId", null);
                                                }
                                            }}
                                            value={field.value?.toString() || "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an event" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {events.map((event) => (
                                                    <SelectItem key={event.id} value={event.shop?.id?.toString() || `event-${event.id}`}>
                                                        {event.title} {event.shop ? '✓' : '(No shop yet)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select an event to associate with the product
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Store Selection - Select from organization */}
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="storeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store (Optional)</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                const storeId = value && value !== "none" ? parseInt(value) : null;
                                                field.onChange(storeId);
                                                // Clear shop selection when store is selected
                                                if (storeId) {
                                                    form.setValue("shopId", null);
                                                }
                                            }}
                                            value={field.value?.toString() || "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a store from organization" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {stores.map((store) => (
                                                    <SelectItem key={store.id} value={store.id.toString()}>
                                                        {store.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select a store from your organization (mutually exclusive with shop)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                rules={isEdit ? {} : { required: "Price is required", min: { value: 0, message: "Price must be 0 or greater" } }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                rules={isEdit ? {} : { required: "Stock quantity is required", min: { value: 0, message: "Stock must be 0 or greater" } }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Quantity *</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="limitPerUser"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limit Per User</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                name="pointsEarnedPerUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points Per Unit</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <ImageUpload
                                onImageSelect={setProductImageFile}
                            />
                            <p className="text-sm text-muted-foreground">Upload a product image (optional)</p>
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
