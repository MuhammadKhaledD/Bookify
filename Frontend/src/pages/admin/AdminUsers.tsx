/**
 * AdminUsers.tsx
 *
 * User Management Page for Admins
 * - View all users by role (Admins, Organizers, Regular Users, Banned Users)
 * - Perform role-based actions on users
 * - Ban/Unban users
 * - Delete banned users permanently
 *
 * Role-based Actions:
 * - ADMINS: Add/Remove Organizer role
 * - ORGANIZERS: Add to Admin, Remove Organizer role, Ban
 * - REGULAR USERS: Add to Admin, Add to Organizer, Ban
 * - BANNED USERS: Unban, Delete permanently
 */

import { useState, useEffect } from "react";
import { userManagementApi, roleApi, organizationApi, User, Role } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, MoreVertical, Shield, Users, UserCheck, Ban, Trash2 } from "lucide-react";

type UserRole = "Admin" | "Organizer" | "User" | "Banned";

interface UserWithActions extends User {
  role: UserRole;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // User lists
  const [allUsers, setAllUsers] = useState<UserWithActions[]>([]);
  const [admins, setAdmins] = useState<UserWithActions[]>([]);
  const [organizers, setOrganizers] = useState<UserWithActions[]>([]);
  const [regularUsers, setRegularUsers] = useState<UserWithActions[]>([]);
  const [bannedUsers, setBannedUsers] = useState<UserWithActions[]>([]);

  // Role IDs
  const [roles, setRoles] = useState<Role[]>([]);
  const [adminRoleId, setAdminRoleId] = useState<string>("");
  const [organizerRoleId, setOrganizerRoleId] = useState<string>("");
  const [rolesLoaded, setRolesLoaded] = useState(false);

  // Organizations
  const [allOrganizations, setAllOrganizations] = useState<any[]>([]);

  // Action states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    userId: string;
    userName: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    action: "",
    userId: "",
    userName: "",
    description: "",
    onConfirm: async () => { },
  });

  // Organization selector dialog
  const [orgSelectorDialog, setOrgSelectorDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    selectedOrgId: number | null;
  }>({
    open: false,
    userId: "",
    userName: "",
    selectedOrgId: null,
  });

  // Initialize - Get roles first
  useEffect(() => {
    const initializeRoles = async () => {
      try {
        console.log("Fetching roles...");
        const rolesData = await roleApi.getAllRoles();
        console.log("Roles fetched:", rolesData);

        if (!rolesData || rolesData.length === 0) {
          console.warn("No roles returned from backend");
          setRolesLoaded(true);
          return;
        }

        setRoles(rolesData);

        // Find Admin and Organizer role IDs
        const adminRole = rolesData.find((r: Role) => r.roleName === "Admin");
        const organizerRole = rolesData.find((r: Role) => r.roleName === "Organizer");

        if (adminRole) {
          setAdminRoleId(adminRole.roleId);
          console.log("✅ Admin Role ID:", adminRole.roleId);
        } else {
          console.warn("⚠️ Admin role not found in roles list");
        }

        if (organizerRole) {
          setOrganizerRoleId(organizerRole.roleId);
          console.log("✅ Organizer Role ID:", organizerRole.roleId);
        } else {
          console.warn("⚠️ Organizer role not found in roles list");
        }

        setRolesLoaded(true);
      } catch (error) {
        console.error("❌ Failed to fetch roles:", error);
        toast.error("Failed to load roles - some features may be limited");
        setRolesLoaded(true); // Allow loading to continue anyway
      }
    };

    initializeRoles();
  }, []);

  // Fetch all organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await organizationApi.getAll();
        setAllOrganizations(orgs);
        console.log("✅ Organizations fetched:", orgs);
      } catch (error) {
        console.error("❌ Failed to fetch organizations:", error);
        toast.error("Failed to load organizations");
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch all users
  useEffect(() => {
    if (!rolesLoaded) return; // Wait for roles initialization to complete (even if it failed)

    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching users...");

        const [allUsersData, adminsData, organizersData, bannedUsersData] = await Promise.all([
          userManagementApi.getAllUsers(),
          userManagementApi.getAdminUsers(),
          userManagementApi.getOrganizerUsers(),
          userManagementApi.getBannedUsers(),
        ]);

        console.log("All users data:", allUsersData);
        console.log("Admins data:", adminsData);
        console.log("Organizers data:", organizersData);
        console.log("Banned users data:", bannedUsersData);

        // Process and categorize users
        const allProcessed = (allUsersData || []).map((u: User) => categorizeUser(u));
        setAllUsers(allProcessed);

        const adminsProcessed = (adminsData || []).map((u: User) => ({
          ...u,
          role: "Admin" as UserRole,
        }));
        setAdmins(adminsProcessed);

        const organizersProcessed = (organizersData || []).map((u: User) => ({
          ...u,
          role: "Organizer" as UserRole,
        }));
        setOrganizers(organizersProcessed);

        const bannedProcessed = (bannedUsersData || []).map((u: User) => ({
          ...u,
          role: "Banned" as UserRole,
        }));
        setBannedUsers(bannedProcessed);

        // Calculate regular users
        const regularUserIds = new Set(
          allProcessed
            .filter((u: UserWithActions) => u.role === "User")
            .map((u: UserWithActions) => u.id)
        );
        setRegularUsers(Array.from(regularUserIds).map((id) => allProcessed.find((u) => u.id === id)!));
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [rolesLoaded]);

  // Categorize user based on roles
  const categorizeUser = (user: User): UserWithActions => {
    if (user.isBanned) {
      return { ...user, role: "Banned" };
    } else if (user.roles?.includes("Admin")) {
      return { ...user, role: "Admin" };
    } else if (user.roles?.includes("Organizer")) {
      return { ...user, role: "Organizer" };
    } else {
      return { ...user, role: "User" };
    }
  };

  // Refresh all users after action
  const refreshUsers = async () => {
    try {
      const [allUsersData, adminsData, organizersData, bannedUsersData] = await Promise.all([
        userManagementApi.getAllUsers(),
        userManagementApi.getAdminUsers(),
        userManagementApi.getOrganizerUsers(),
        userManagementApi.getBannedUsers(),
      ]);

      const allProcessed = (allUsersData || []).map((u: User) => categorizeUser(u));
      setAllUsers(allProcessed);

      setAdmins((adminsData || []).map((u: User) => ({ ...u, role: "Admin" as UserRole })));
      setOrganizers((organizersData || []).map((u: User) => ({ ...u, role: "Organizer" as UserRole })));
      setBannedUsers((bannedUsersData || []).map((u: User) => ({ ...u, role: "Banned" as UserRole })));

      const regularUserIds = new Set(
        allProcessed.filter((u: UserWithActions) => u.role === "User").map((u: UserWithActions) => u.id)
      );
      setRegularUsers(Array.from(regularUserIds).map((id) => allProcessed.find((u) => u.id === id)!));
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  };

  // Action handlers
  const handleAddRole = async (userId: string, roleType: "Admin" | "Organizer", userName: string) => {
    // For Organizer role, show organization selector dialog first
    if (roleType === "Organizer") {
      setOrgSelectorDialog({
        open: true,
        userId,
        userName,
        selectedOrgId: null,
      });
      return;
    }

    // For Admin role, proceed directly
    const roleId = adminRoleId;
    if (!roleId) {
      toast.error("Role ID not found");
      return;
    }

    setConfirmDialog({
      open: true,
      action: `add-${roleType}`,
      userId,
      userName,
      description: `Are you sure you want to add the ${roleType} role to ${userName}?`,
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          console.log(`Adding ${roleType} role to user ${userId} with role ID ${roleId}`);
          await roleApi.addUserToRole(userId, roleId);
          toast.success(`${roleType} role added to ${userName}`);
          await refreshUsers();
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error(`Error adding ${roleType} role:`, error);
          toast.error(`Failed to add ${roleType} role`);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleRemoveRole = async (userId: string, roleType: "Admin" | "Organizer", userName: string) => {
    const roleId = roleType === "Admin" ? adminRoleId : organizerRoleId;
    if (!roleId) {
      toast.error("Role ID not found");
      return;
    }

    setConfirmDialog({
      open: true,
      action: `remove-${roleType}`,
      userId,
      userName,
      description: `Are you sure you want to remove the ${roleType} role from ${userName}?`,
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          console.log(`Removing ${roleType} role from user ${userId} with role ID ${roleId}`);
          await roleApi.removeUserFromRole(userId, roleId);
          toast.success(`${roleType} role removed from ${userName}`);
          await refreshUsers();
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error(`Error removing ${roleType} role:`, error);
          toast.error(`Failed to remove ${roleType} role`);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleBanUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      action: "ban",
      userId,
      userName,
      description: `Are you sure you want to ban ${userName}? They will not be able to access the platform.`,
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          await userManagementApi.banUser(userId);
          toast.success(`${userName} has been banned`);
          await refreshUsers();
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error("Error banning user:", error);
          toast.error("Failed to ban user");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      action: "unban",
      userId,
      userName,
      description: `Are you sure you want to unban ${userName}? They will regain access to the platform.`,
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          await userManagementApi.unbanUser(userId);
          toast.success(`${userName} has been unbanned`);
          await refreshUsers();
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error("Error unbanning user:", error);
          toast.error("Failed to unban user");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDeletePermanently = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      action: "delete",
      userId,
      userName,
      description: `⚠️ WARNING: You are about to permanently delete ${userName} and all their data. This action cannot be undone!`,
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          await userManagementApi.deleteUserPermanently(userId);
          toast.success(`${userName} has been permanently deleted`);
          await refreshUsers();
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Handle organization selector confirmation
  const handleConfirmOrganizerWithOrg = async () => {
    const { userId, userName, selectedOrgId } = orgSelectorDialog;

    if (!selectedOrgId) {
      toast.error("Please select an organization");
      return;
    }

    if (!organizerRoleId) {
      toast.error("Organizer role ID not found");
      return;
    }

    try {
      setActionLoading(userId);
      console.log(`Adding Organizer role to user ${userId} for organization ${selectedOrgId}`);
      await roleApi.addUserToRole(userId, organizerRoleId, selectedOrgId.toString());
      toast.success(`Organizer role added to ${userName}`);
      await refreshUsers();
      setOrgSelectorDialog({ open: false, userId: "", userName: "", selectedOrgId: null });
    } catch (error) {
      console.error("Error adding Organizer role:", error);
      toast.error("Failed to add Organizer role");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search
  const filterUsers = (users: UserWithActions[]) => {
    return users.filter((u) =>
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // User Row Component
  const UserRow = ({ user, role }: { user: UserWithActions; role: UserRole }) => {
    const isDisabled = actionLoading === user.id;

    return (
      <TableRow>
        <TableCell className="font-medium">{user.userName}</TableCell>
        <TableCell>{user.name || "-"}</TableCell>
        <TableCell className="text-sm">{user.email}</TableCell>
        <TableCell>
          <div className="flex gap-2 flex-wrap">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((r) => (
                <Badge key={r} variant="outline">
                  <span className="text-xs">{r}</span>
                </Badge>
              ))
            ) : (
              <Badge variant="outline">
                <span className="text-xs">User</span>
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm">
          {user.createdOn ? (
            (() => {
              const date = new Date(user.createdOn);
              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
            })()
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDisabled}>
                {isDisabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {role === "Admin" && (
                <>
                  {!user.roles?.includes("Organizer") ? (
                    <DropdownMenuItem onClick={() => handleAddRole(user.id, "Organizer", user.userName)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Add Organizer
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleRemoveRole(user.id, "Organizer", user.userName)}>
                      <Users className="mr-2 h-4 w-4" />
                      Remove Organizer
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {role === "Organizer" && (
                <>
                  <DropdownMenuItem onClick={() => handleAddRole(user.id, "Admin", user.userName)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Add Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRemoveRole(user.id, "Organizer", user.userName)}>
                    <Users className="mr-2 h-4 w-4" />
                    Remove Organizer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBanUser(user.id, user.userName)} className="text-destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                </>
              )}

              {role === "User" && (
                <>
                  <DropdownMenuItem onClick={() => handleAddRole(user.id, "Admin", user.userName)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Add Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddRole(user.id, "Organizer", user.userName)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Add Organizer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBanUser(user.id, user.userName)} className="text-destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                </>
              )}

              {role === "Banned" && (
                <>
                  <DropdownMenuItem onClick={() => handleUnbanUser(user.id, user.userName)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unban User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeletePermanently(user.id, user.userName)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              User Management
            </span>
          </h1>
          <p className="text-muted-foreground">Manage platform users, roles, and permissions</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Admin users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Organizer users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bannedUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently banned</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Tabs for different user categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({allUsers.length})</TabsTrigger>
            <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
            <TabsTrigger value="organizers">Organizers ({organizers.length})</TabsTrigger>
            <TabsTrigger value="banned">Banned ({bannedUsers.length})</TabsTrigger>
          </TabsList>

          {/* ALL USERS TAB */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                {filterUsers(allUsers).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Join</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(allUsers).map((u) => (
                          <UserRow key={u.id} user={u} role={u.role} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Action: Add/Remove Organizer role</CardDescription>
              </CardHeader>
              <CardContent>
                {filterUsers(admins).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No admin users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Join</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(admins).map((u) => (
                          <UserRow key={u.id} user={u} role="Admin" />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORGANIZERS TAB */}
          <TabsContent value="organizers">
            <Card>
              <CardHeader>
                <CardTitle>Organizer Users</CardTitle>
                <CardDescription>Actions: Add Admin role, Remove Organizer role, Ban</CardDescription>
              </CardHeader>
              <CardContent>
                {filterUsers(organizers).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No organizer users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Join</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(organizers).map((u) => (
                          <UserRow key={u.id} user={u} role="Organizer" />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BANNED USERS TAB */}
          <TabsContent value="banned">
            <Card>
              <CardHeader>
                <CardTitle>Banned Users</CardTitle>
                <CardDescription>Actions: Unban, Delete Permanently</CardDescription>
              </CardHeader>
              <CardContent>
                {filterUsers(bannedUsers).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No banned users</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Join</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(bannedUsers).map((u) => (
                          <UserRow key={u.id} user={u} role="Banned" />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDialog.onConfirm}
                className={
                  confirmDialog.action === "ban" || confirmDialog.action === "delete"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
                disabled={actionLoading === confirmDialog.userId}
              >
                {actionLoading === confirmDialog.userId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Organization Selector Dialog */}
        <AlertDialog
          open={orgSelectorDialog.open}
          onOpenChange={(open) => setOrgSelectorDialog({ ...orgSelectorDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Organization</AlertDialogTitle>
              <AlertDialogDescription>
                Choose which organization {orgSelectorDialog.userName} will be an organizer for.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="organization">Organization *</Label>
              <Select
                value={orgSelectorDialog.selectedOrgId?.toString() || ""}
                onValueChange={(value) =>
                  setOrgSelectorDialog({ ...orgSelectorDialog, selectedOrgId: parseInt(value) })
                }
              >
                <SelectTrigger id="organization" className="mt-2">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {allOrganizations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No organizations available
                    </SelectItem>
                  ) : (
                    allOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel onClick={() => setOrgSelectorDialog({ ...orgSelectorDialog, open: false })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmOrganizerWithOrg}
                disabled={!orgSelectorDialog.selectedOrgId || actionLoading === orgSelectorDialog.userId}
              >
                {actionLoading === orgSelectorDialog.userId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add Organizer"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
