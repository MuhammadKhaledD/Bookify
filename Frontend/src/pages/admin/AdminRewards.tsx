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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Edit, Trash2, Plus, Gift } from "lucide-react";
import { rewardsApi } from "@/lib/api";
import { RewardFormDialog } from "@/components/RewardFormDialog";
import { toast } from "@/hooks/use-toast";

interface Reward {
    id: number;
    name: string;
    description?: string;
    pointsRequired: number;
    rewardType: string;
    discount?: number;
    expireDate: string;
    status: boolean;
}

export default function AdminRewards() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const data = await rewardsApi.getAll();
            setRewards(data);
        } catch (error) {
            console.error("Failed to fetch rewards:", error);
            toast({
                title: "Error",
                description: "Failed to load rewards.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const filtered = rewards.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this reward?")) {
            try {
                await rewardsApi.delete(id);
                toast({
                    title: "Reward deleted",
                    description: "The reward has been deleted successfully.",
                });
                fetchRewards();
            } catch (error: any) {
                console.error("Failed to delete reward:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete reward. It may have associated data.";
                toast({
                    title: "Delete Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (reward: Reward) => {
        setEditingReward(reward);
        setCreateDialogOpen(true);
    };

    const handleCreateOpen = () => {
        setEditingReward(null);
        setCreateDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Reward Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Configure loyalty rewards</p>
                    </div>
                    <Button
                        onClick={handleCreateOpen}
                        className="gap-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Add Reward
                    </Button>
                </div>

                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Active Rewards</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search rewards..."
                                    className="pl-9 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reward Name</TableHead>
                                    <TableHead>Points Required</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Status</TableHead>
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
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No rewards found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((reward) => (
                                        <TableRow key={reward.id}>
                                            <TableCell className="font-semibold flex items-center gap-2">
                                                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                                                    <Gift className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                {reward.name}
                                            </TableCell>
                                            <TableCell>{reward.pointsRequired} pts</TableCell>
                                            <TableCell>{reward.rewardType}</TableCell>
                                            <TableCell>
                                                {new Date(reward.expireDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reward.status
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {reward.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(reward)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(reward.id)}
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

                <RewardFormDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    reward={editingReward}
                    onSuccess={fetchRewards}
                />
            </div>
        </div>
    );
}
