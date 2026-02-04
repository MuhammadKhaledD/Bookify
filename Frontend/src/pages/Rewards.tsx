/**
 * Rewards.tsx
 *
 * Loyalty rewards program page featuring:
 * - Current points balance and tier progress
 * - Available rewards grid with point requirements
 * - Reward redemption functionality
 * - Redemption history tracking
 * - Points earning information
 * - Progress bar showing advancement to next tier
 *
 * Incentivizes user engagement through loyalty rewards
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Star,
  Award,
  Sparkles,
  Ticket,
  Percent,
  Package,
  LogIn,
  UserPlus,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { RewardCard } from "@/components/RewardCard";
import { RewardFormDialog } from "@/components/RewardFormDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser, type User } from "@/store/slices/authSlice";
import { isAdmin } from "@/utils/roles";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: string;
  discount: number;
  expireDate: string;
  status: boolean;
  itemProductId: number | null;
  itemTicketId: number | null;
  isDeleted: boolean;
}



interface LoyaltyPoints {
  points: number;
  [key: string]: any;
}

interface RedemptionHistoryItem {
  id: number;
  rewardId: number;
  rewardName?: string;
  pointsSpent: number;
  redemptionDate: string;
  [key: string]: any;
}

// Map reward types to icons
const getRewardIcon = (rewardType: string) => {
  switch (rewardType) {
    case "Voucher":
    case "Free Ticket":
      return Ticket;
    case "Discount":
      return Percent;
    case "VIP Pass":
    case "Premium Access":
      return Star;
    case "BOGO":
      return Package;
    case "Free Shipping":
      return Package;
    case "Festival Pass":
      return Sparkles;
    case "Upgrade":
      return Award;
    default:
      return Gift;
  }
};

export default function Rewards() {
  const { roles } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const showAdminControls = isAdmin(roles);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [redemptionHistory, setRedemptionHistory] = useState<
    RedemptionHistoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [redeeming, setRedeeming] = useState<number | null>(null);

  // Admin CRUD states
  const [formOpen, setFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null);

  // Step 1: Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const response = await api.get<User>("/auth/me");
        setIsAuthenticated(true);
        setUser(response.data);
      } catch (err: any) {
        // 401 means not authenticated (guest)
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.error("Auth check error:", err);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Step 2: Fetch rewards (always, for both guests and logged-in users)
  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get<Reward[]>("/rewards");
        // Filter out deleted rewards and only show active ones
        const activeRewards = response.data.filter(
          (reward) => !reward.isDeleted && reward.status
        );
        setRewards(activeRewards);
      } catch (err) {
        setError("Failed to load rewards. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load rewards. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Step 3: If logged in, fetch user-specific data
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPoints(0);
      setRedemptionHistory([]);
      return;
    }

    // Use loyalty points from Redux user object (same source as Profile page)
    setCurrentPoints(user?.loyaltyPoints || 0);

    const fetchUserData = async () => {
      try {
        // Fetch redemption history - GET /api/redemptions/me
        const historyResponse = await api.get<RedemptionHistoryItem[]>(
          "/redemptions/me"
        );
        setRedemptionHistory(historyResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch redemption history:", err);
        setRedemptionHistory([]);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.loyaltyPoints]); // Re-run when loyaltyPoints changes

  const handleRedeem = async (
    rewardId: number,
    rewardName: string,
    pointsRequired: number
  ) => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = "/login";
      return;
    }

    if (currentPoints < pointsRequired) {
      toast({
        title: "Insufficient points",
        description: `You need ${pointsRequired - currentPoints
          } more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(rewardId);
    try {
      // POST /api/redemptions with { RewardId: number } body
      await api.post("/redemptions", { RewardId: rewardId });
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${rewardName}.`,
      });

      // Refresh user data from /auth/me and update Redux
      const userResponse = await api.get<User>("/auth/me");
      dispatch(updateUser(userResponse.data));
      setUser(userResponse.data);

      // GET /api/redemptions/me
      const historyResponse = await api.get<RedemptionHistoryItem[]>(
        "/redemptions/me"
      );
      setRedemptionHistory(historyResponse.data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to redeem reward. Please try again.";
      toast({
        title: "Redemption failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expireDate: string) => {
    return new Date(expireDate) < new Date();
  };

  // Admin: Open create dialog
  const handleCreate = () => {
    setEditingReward(null);
    setFormOpen(true);
  };

  // Admin: Open edit dialog
  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormOpen(true);
  };

  // Admin: Open delete confirmation
  const handleDeleteClick = (reward: Reward) => {
    setDeletingReward(reward);
    setDeleteDialogOpen(true);
  };

  // Admin: Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingReward) return;

    try {
      await api.delete(`/rewards/${deletingReward.id}`);
      toast({
        title: "Reward deleted",
        description: "The reward has been deleted successfully.",
      });
      // Refresh rewards list
      const response = await api.get<Reward[]>("/rewards");
      const activeRewards = response.data.filter(
        (reward) => !reward.isDeleted && reward.status
      );
      setRewards(activeRewards);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete reward.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingReward(null);
    }
  };

  // Refresh rewards after CRUD operations
  const refreshRewards = async () => {
    try {
      const response = await api.get<Reward[]>("/rewards");
      const activeRewards = response.data.filter(
        (reward) => !reward.isDeleted && reward.status
      );
      setRewards(activeRewards);
    } catch (err) {
      console.error("Failed to refresh rewards:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading your rewards..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Loyalty Rewards
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Earn points with every purchase and redeem them for exclusive
            rewards
          </p>
        </div >

        {/* Points Overview for authenticated users OR Sign Up prompt for guests */}
        {
          isAuthenticated ? (
            <Card className="mb-12 border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-background">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Available Points
                    </p>
                    <div className="text-6xl md:text-7xl font-bold text-primary drop-shadow-sm">
                      {currentPoints}
                    </div>
                  </div>
                  <div className="text-center md:text-right text-muted-foreground">
                    <p className="text-sm">
                      Earn points with every purchase and redeem them for exclusive rewards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-12 border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-background shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30"></div>
                      <div className="relative bg-gradient-to-br from-primary to-secondary p-6 rounded-full">
                        <Gift className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                      Start Earning Rewards Today!
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                      Join thousands of members earning loyalty points with every
                      purchase. Unlock exclusive rewards and special discounts!
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                    <Button
                      asChild
                      size="lg"
                      className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
                    >
                      <Link
                        to="/signup"
                        className="flex items-center justify-center gap-2"
                      >
                        <UserPlus className="h-5 w-5" />
                        Sign Up Now
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                    >
                      <Link
                        to="/login"
                        className="flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-5 w-5" />
                        Log In
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>Earn Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Redeem Rewards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <span>Exclusive Deals</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Available Rewards */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Available Rewards</h2>
            {showAdminControls && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Reward
              </Button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading rewards...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : rewards && rewards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No rewards available at this time.
              </p>
            </div>
          ) : rewards ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const Icon = getRewardIcon(reward.rewardType);
                const canRedeem =
                  isAuthenticated && currentPoints >= reward.pointsRequired;
                const expired = isExpired(reward.expireDate);

                return (
                  <div key={reward.id} className="relative group">
                    <RewardCard
                      id={reward.id}
                      name={reward.name}
                      description={reward.description}
                      pointsRequired={reward.pointsRequired}
                      rewardType={reward.rewardType}
                      discount={reward.discount}
                      expireDate={formatDate(reward.expireDate)}
                      expired={expired}
                      canRedeem={canRedeem}
                      isAuthenticated={isAuthenticated}
                      isRedeeming={redeeming === reward.id}
                      Icon={Icon}
                      onRedeem={() =>
                        handleRedeem(
                          reward.id,
                          reward.name,
                          reward.pointsRequired
                        )
                      }
                      buttonText={
                        redeeming === reward.id
                          ? "Redeeming..."
                          : expired
                            ? "Expired"
                            : isAuthenticated && !canRedeem
                              ? "Not Enough Points"
                              : "Redeem"
                      }
                    />
                    {showAdminControls && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(reward)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteClick(reward)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div >

      {/* Admin Dialogs */}
      {
        showAdminControls && (
          <>
            <RewardFormDialog
              open={formOpen}
              onOpenChange={setFormOpen}
              reward={editingReward}
              onSuccess={refreshRewards}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{deletingReward?.name}"? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      }
    </div >
  );
}

/**
 * Future Improvements:
 * - Add tiered membership levels with exclusive benefits
 * - Implement referral rewards program
 * - Add bonus point campaigns and limited-time offers
 * - Include reward expiration dates and notifications
 * - Add gamification elements (badges, achievements)
 * - Implement partner rewards and cross-promotions
 * - Add reward gifting functionality
 * - Include points multiplier events
 * - Add reward previews before redemption
 * - Implement dynamic reward suggestions based on user preferences
 */
