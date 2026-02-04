
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ShopFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: number | null;
    onSuccess: () => void;
}

interface ShopFormData {
    eventId: number;
    name: string;
    description: string;
    status: boolean;
    shopLogo: string;
}

export function ShopFormDialog({
    open,
    onOpenChange,
    eventId,
    onSuccess,
}: ShopFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [shopLogoFile, setShopLogoFile] = useState<File | null>(null);

    const form = useForm<ShopFormData>({
        defaultValues: {
            eventId: 0,
            name: "",
            description: "",
            status: true,
            shopLogo: "",
        },
    });

    useEffect(() => {
        if (open && eventId) {
            form.reset({
                eventId: eventId,
                name: "",
                description: "",
                status: true,
                shopLogo: "https://ebraebra.blob.core.windows.net/events/event.jpg", // Default placeholder
            });
            setShopLogoFile(null);
        }
    }, [open, eventId, form]);

    const onSubmit = async (data: ShopFormData) => {
        if (!eventId) return;

        setLoading(true);
        try {
            // If we have a file, we might need to upload it first or send as FormData
            // The API schema provided shows JSON for /api/shops:
            // { "eventId": 0, "name": "string", "description": "string", "status": true, "shopLogo": "string" }
            // So for now we'll stick to JSON and maybe the backend handles the logo URL or we need a separate upload endpoint.
            // Assuming for now we send the default URL or text URL. if file upload is needed, the backend usually expects multipart/form-data.
            // The user's schema example showed "shopLogo": "string", so sticking to JSON.

            const payload = {
                ...data,
                eventId: eventId,
            };

            await api.post("/shops", payload);

            toast({
                title: "Success",
                description: "Shop created successfully.",
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to create shop:", error);
            const errorMessage = error.response?.data?.message || "Failed to create shop.";
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Shop</DialogTitle>
                    <DialogDescription>
                        Create a shop for this event to sell products.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Shop name is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shop Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter shop name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            rules={{ required: "Description is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Shop description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* URL input for logo for now as per schema */}
                        <FormField
                            control={form.control}
                            name="shopLogo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shop Logo URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active Status</FormLabel>
                                        <DialogDescription>
                                            Is this shop currently active?
                                        </DialogDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Shop"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
