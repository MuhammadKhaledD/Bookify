/**
 * Profile.tsx
 * 
 * User profile management page featuring:
 * - Personal information display and editing
 * - Loyalty points and tier status showcase
 * - Password change functionality
 * - Profile avatar and user details
 * - Account settings management
 * - Save changes with validation
 * 
 * Central location for users to manage their account
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Award, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { ImageUpload } from "@/components/ImageUpload";
import api from "@/lib/api";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Use loyaltyPoints from Redux for auto-updates
  const loyaltyPoints = user?.loyaltyPoints || 0;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        dispatch(updateUser(userData));
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          address: userData.address || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        address: user.address || "",
      });
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [isAuthenticated, navigate, dispatch, user]);

  const getTier = (points: number) => {
    if (points >= 2000) return "Gold";
    if (points >= 1000) return "Silver";
    return "Bronze";
  };

  const tier = getTier(loyaltyPoints);


  const handleSave = async () => {
    try {
      setLoading(true);

      // Call the actual edit profile API endpoint
      const formDataToSend = new FormData();
      if (formData.name) formDataToSend.append('Name', formData.name);
      if (user?.userName) formDataToSend.append('UserName', user.userName); // Keep username same
      if (formData.address) formDataToSend.append('Address', formData.address);
      if (profileImageFile) formDataToSend.append('ProfilePictureFile', profileImageFile);

      await api.put('/auth/editprofile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch fresh user data from server to update Redux store
      const response = await api.get("/auth/me");
      dispatch(updateUser(response.data));

      // Update local form data
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        address: response.data.address || "",
      });
      setProfileImageFile(null);

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Profile
          </span>
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                {isEditing ? (
                  <div className="mb-4">
                    <div className="flex justify-center">
                      <ImageUpload
                        onImageSelect={setProfileImageFile}
                        preview={user?.profilePicture}
                        className="w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                )}
                <h2 className="text-xl font-bold mb-1">
                  {formData.name || user?.userName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">@{user?.userName}</p>
                <p className="text-xs text-muted-foreground mt-1">{formData.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Loyalty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{loyaltyPoints}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <div className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium">
                    {tier} Tier
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? "Save Changes" : "Edit"}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileImageFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (cannot be changed)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep your account secure by using a strong, unique password.
                </p>
                <Button onClick={() => setChangePasswordOpen(true)}>
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Change Password Dialog */}
            <ChangePasswordDialog
              open={changePasswordOpen}
              onOpenChange={setChangePasswordOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Future Improvements:
 * - Add profile photo upload and cropping
 * - Implement email verification system
 * - Add two-factor authentication (2FA)
 * - Include notification preferences management
 * - Add account deletion option with confirmation
 * - Implement privacy settings control
 * - Add connected accounts (social login management)
 * - Include activity log/history
 * - Add export personal data feature (GDPR compliance)
 * - Implement password strength indicator
 */
