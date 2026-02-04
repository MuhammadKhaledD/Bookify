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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { organizationApi } from "@/lib/api";

interface Organization {
    id?: number;
    name: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
}

interface OrgFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization?: Organization | null;
    onSuccess: () => void;
}

export function OrgFormDialog({
    open,
    onOpenChange,
    organization,
    onSuccess,
}: OrgFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const isEdit = !!organization;

    const form = useForm<Organization>({
        defaultValues: {
            name: "",
            description: "",
            contactEmail: "",
            contactPhone: "",
            address: "",
        },
    });

    useEffect(() => {
        if (organization) {
            form.reset({
                name: organization.name,
                description: organization.description || "",
                contactEmail: organization.contactEmail || "",
                contactPhone: organization.contactPhone || "",
                address: organization.address || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                contactEmail: "",
                contactPhone: "",
                address: "",
            });
        }
    }, [organization, form, open]);

    const onSubmit = async (data: Organization) => {
        setLoading(true);
        try {
            // Sanitize data - convert empty strings to undefined for optional fields
            const sanitizedData = {
                name: data.name,
                description: data.description?.trim() || undefined,
                contactEmail: data.contactEmail?.trim() || undefined,
                contactPhone: data.contactPhone?.trim() || undefined,
                address: data.address?.trim() || undefined,
            };

            console.log("Submitting organization data:", sanitizedData);
            console.log("Is edit mode:", isEdit, "Organization ID:", organization?.id);

            if (isEdit && organization?.id) {
                const result = await organizationApi.update(organization.id, sanitizedData);
                console.log("Update response:", result);
                toast({
                    title: "Organization updated",
                    description: "The organization has been updated successfully.",
                });
            } else {
                const result = await organizationApi.create(sanitizedData);
                console.log("Create response:", result);
                toast({
                    title: "Organization created",
                    description: "The organization has been created successfully.",
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Full error object:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);
            console.error("Error status:", error.response?.status);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.title ||
                error.message ||
                `Failed to ${isEdit ? "update" : "create"} organization.`;
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Organization" : "Add Organization"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the organization details below."
                            : "Enter the details for the new organization."}
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
                                        <Input placeholder="e.g., Festival Merch Store" {...field} />
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
                                        <Textarea placeholder="Short description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contact@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City, Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
