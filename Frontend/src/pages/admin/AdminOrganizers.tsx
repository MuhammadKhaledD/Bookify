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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, Search, Trash2, Plus, ExternalLink, Edit } from "lucide-react";
import { organizationApi } from "@/lib/api";
import { OrgFormDialog } from "@/components/OrgFormDialog";
import { toast } from "@/hooks/use-toast";

interface Organization {
    id: number;
    name: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
}

export default function AdminOrganizers() {
    const navigate = useNavigate();
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const data = await organizationApi.getAll();
            setOrgs(data);
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
            toast({
                title: "Error",
                description: "Failed to load organizations.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const filteredOrgs = orgs.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this organization? All associated data will be lost.")) {
            try {
                await organizationApi.delete(id);
                toast({
                    title: "Organization deleted",
                    description: "The organization has been deleted successfully.",
                });
                fetchOrgs();
            } catch (error: any) {
                console.error("Failed to delete organization:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete organization. It may have associated data.";
                toast({
                    title: "Delete Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (org: Organization) => {
        setEditingOrg(org);
        setCreateDialogOpen(true);
    };

    const handleCreateOpen = () => {
        setEditingOrg(null);
        setCreateDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Organization Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Oversee registered organizations</p>
                    </div>
                    <Button onClick={handleCreateOpen} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Organization
                    </Button>
                </div>

                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Organizations Directory</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search organizations..."
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
                                    <TableHead>Organization Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Contact Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrgs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No organizations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrgs.map((org) => (
                                        <TableRow key={org.id}>
                                            <TableCell className="font-semibold">{org.name}</TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={org.description}>
                                                {org.description || "-"}
                                            </TableCell>
                                            <TableCell>{org.contactEmail || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate(`/store/${org.id}`)}>
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            View Store
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(org)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(org.id)}
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

                <OrgFormDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    organization={editingOrg}
                    onSuccess={fetchOrgs}
                />
            </div>
        </div>
    );
}

