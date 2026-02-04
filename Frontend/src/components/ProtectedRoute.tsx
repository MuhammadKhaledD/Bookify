/**
 * ProtectedRoute.tsx
 *
 * Route protection component that controls access based on user authentication and role:
 * - Redirects unauthenticated users to login for protected pages
 * - Validates user roles (User, Organizer, Admin)
 * - Shows access denied messages for insufficient permissions
 *
 * Used to wrap routes that require specific user types
 */

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  canAccessAdmin,
  canAccessOrganizer,
  isUser,
  hasAnyRole,
  type RoleName,
} from "@/utils/roles";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: RoleName | RoleName[];
}

export const ProtectedRoute = ({
  children,
  requireAuth = false,
  requireRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, roles } = useAppSelector((state) => state.auth);

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requireRole) {
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    const hasAccess = hasAnyRole(roles, requiredRoles);

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h1 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Access Denied
                </span>
              </h1>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
                {!isAuthenticated && " Please log in to continue."}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              {!isAuthenticated && (
                <Button asChild>
                  <a href="/login">Log In</a>
                </Button>
              )}
            </div>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

/**
 * Future Improvements:
 * - Integrate with real authentication system (Lovable Cloud/Supabase)
 * - Add session persistence and token refresh
 * - Implement role-based UI component visibility
 * - Add loading states during authentication checks
 * - Include redirect to original destination after login
 * - Add permission-based feature flags
 * - Implement organization ownership verification
 * - Add audit logging for access attempts
 * - Include rate limiting for failed access attempts
 * - Add multi-factor authentication support
 */
