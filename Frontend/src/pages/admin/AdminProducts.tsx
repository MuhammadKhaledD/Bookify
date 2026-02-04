import { useState, useEffect } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Edit, Trash2, Plus, Package } from "lucide-react";
import { productsApi, organizationApi } from "@/lib/api";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    shopId?: number;
    storeId?: number;
    orgName?: string; // Organization name from API
    shop?: {
        id: number;
        name: string;
        _event?: {
            org?: {
                id: number;
                name: string;
            }
        }
    };
    store?: {
        id: number;
        name: string;
        orgId?: number;
        org?: {
            id: number;
            name: string;
        }
    };
}

interface Organization {
    id: number;
    name: string;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
    const [organizerOrgIds, setOrganizerOrgIds] = useState<number[]>([]);
    const [orgsFetched, setOrgsFetched] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string>("");
    const { user } = useAppSelector((state) => state.auth);

    const fetchProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await productsApi.getAll();
            console.log("Fetched all products:", data.length);

            // Show ALL products - no automatic filtering
            setProducts(data);

            // Get unique organizations from products for filter dropdown
            const uniqueOrgs = Array.from(new Set(data.map((p: any) => p.orgName).filter(Boolean)))
                .map(name => ({ id: 0, name })); // id not needed for filtering
            setAllOrganizations(uniqueOrgs as any);
            console.log("Available organizations in products:", uniqueOrgs);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            const errorMsg = "Failed to load products.";
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
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
            console.log("===== ORGANIZER ORGANIZATIONS DEBUG =====");
            console.log("Organizer's organizations:", orgs);
            console.log("Organization IDs:", orgIds);
            console.log("Organization Names:", orgs.map((o: any) => o.name));
            console.log("=========================================");
        } catch (error) {
            console.error("Failed to fetch organizer organizations:", error);
            // Set empty arrays to allow the page to still function
            setOrganizerOrgIds([]);
            setOrganizations([]);
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

    // Fetch products after organizerOrgIds is set
    useEffect(() => {
        if (!orgsFetched) {
            // Wait for organizations to be fetched
            return;
        }
        fetchProducts();
    }, [orgsFetched]);



    // Search and organization filter
    const filtered = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Filter by selected org name (selectedOrgId is the index in allOrganizations array)
        const matchesOrg = selectedOrgId === null || p.orgName === allOrganizations[selectedOrgId]?.name;
        return matchesSearch && matchesOrg;
    });

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await productsApi.delete(id);
                toast({
                    title: "Product deleted",
                    description: "The product has been deleted successfully.",
                });
                fetchProducts();
            } catch (error: any) {
                console.error("Failed to delete product:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete product. It may have associated data.";
                toast({
                    title: "Delete Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setCreateDialogOpen(true);
    };

    const handleCreateOpen = () => {
        setEditingProduct(null);
        setCreateDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Product Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage event and store products</p>
                    </div>
                    <Button
                        onClick={handleCreateOpen}
                        className="gap-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>

                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <CardTitle>Products</CardTitle>
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
                                        placeholder="Search products..."
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
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price (EGP)</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-destructive">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-semibold flex items-center gap-2">
                                                <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {product.description}
                                            </TableCell>
                                            <TableCell>EGP {product.price.toFixed(2)}</TableCell>
                                            <TableCell>{product.stockQuantity}</TableCell>
                                            <TableCell>{product.orgName || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(product.id)}
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

                <ProductFormDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    product={editingProduct}
                    onSuccess={fetchProducts}
                    organizerOrgIds={organizerOrgIds}
                />
            </div>
        </div>
    );
}
