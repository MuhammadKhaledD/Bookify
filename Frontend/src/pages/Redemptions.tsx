/**
 * Redemptions.tsx
 * 
 * User redemptions history page featuring:
 * - List of all redeemed rewards
 * - Redemption details (date, reward info)
 * - Organized like Orders page but for redemptions
 * 
 * Shows history of rewards the user has redeemed
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

interface Redemption {
    id: number;
    rewardId: number;
    rewardName: string;
    rewardDescription: string;
    pointsCost: number;
    redeemedAt: string;
    status: string;
}

export default function Redemptions() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        fetchRedemptions();
    }, [isAuthenticated, navigate]);

    const fetchRedemptions = async () => {
        try {
            setLoading(true);
            const response = await api.get("/redemptions/me");
            console.log("Redemptions API response:", response.data);

            // Map backend fields to frontend expected fields
            const mappedRedemptions = (response.data || []).map((item: any) => ({
                id: item.id || item.redemptionId,
                rewardId: item.rewardId,
                rewardName: item.rewardName || item.reward?.name || "Unknown Reward",
                rewardDescription: item.rewardDescription || item.reward?.description || "",
                pointsCost: item.pointsCost || item.pointsSpent || item.pointsRequired || 0,
                redeemedAt: item.redeemedAt || item.redemptionDate || item.createdAt,
                status: item.status || "Redeemed",
            }));

            console.log("Mapped redemptions:", mappedRedemptions);
            setRedemptions(mappedRedemptions);
        } catch (error: any) {
            console.error("Error fetching redemptions:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to load redemptions.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading your redemptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            My Redemptions
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        View your reward redemption history
                    </p>
                </div>

                {redemptions.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-muted">
                                    <Gift className="h-12 w-12 text-muted-foreground" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">No Redemptions Yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    You haven't redeemed any rewards yet. Visit the Rewards page to browse and redeem available rewards with your points!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {redemptions.map((redemption) => (
                            <Card key={redemption.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                <Gift className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{redemption.rewardName}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(redemption.redeemedAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Redeemed
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            {redemption.rewardDescription}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Points Used:</span>
                                                <span className="font-semibold text-primary">
                                                    {redemption.pointsCost} pts
                                                </span>
                                            </div>
                                            <Badge variant="outline">
                                                Redemption #{redemption.id}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
