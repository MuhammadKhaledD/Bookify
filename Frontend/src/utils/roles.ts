

/**
 * Utility functions for role-based access control
 */

export type RoleName = "User" | "Organizer" | "Admin";

/**
 * Check if user has a specific role (case-insensitive)
 */
export const hasRole = (roles: string[], roleName: RoleName): boolean => {
  if (!roles) return false;
  const upperRoleName = roleName.toUpperCase();
  return roles.some((r) => r.toUpperCase() === upperRoleName);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[], roleNames: RoleName[]): boolean => {
  return roleNames.some((roleName) => hasRole(roles, roleName));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (roles: string[], roleNames: RoleName[]): boolean => {
  return roleNames.every((roleName) => hasRole(roles, roleName));
};

/**
 * Check if user is a regular user (can add to cart, view events/products)
 */
export const isUser = (roles: string[]): boolean => {
  return hasRole(roles, "User");
};

/**
 * Check if user is an organizer (can CRUD events, add to shop/products, but can't add to cart)
 */
export const isOrganizer = (roles: string[]): boolean => {
  return hasRole(roles, "Organizer");
};

/**
 * Check if user is an admin (can read everything, remove events/products, block/delete users, manage roles, but can't add)
 */
export const isAdmin = (roles: string[]): boolean => {
  return hasRole(roles, "Admin");
};

/**
 * Check if user is both organizer and user
 */
export const isOrganizerAndUser = (roles: string[]): boolean => {
  return hasAllRoles(roles, ["Organizer", "User"]);
};

/**
 * Check if user can add to cart (users can add to cart, organizers alone cannot, but organizer+user can)
 */
export const canAddToCart = (roles: string[]): boolean => {
  // If user has the "User" role, they can add to cart (even if they're also an Organizer)
  return isUser(roles);
};

/**
 * Check if user can manage events (organizers and admins)
 */
export const canManageEvents = (roles: string[]): boolean => {
  return isOrganizer(roles) || isAdmin(roles);
};

/**
 * Check if user can manage products (organizers and admins)
 */
export const canManageProducts = (roles: string[]): boolean => {
  return isOrganizer(roles) || isAdmin(roles);
};

/**
 * Check if user can delete/remove content (admins only)
 */
export const canDeleteContent = (roles: string[]): boolean => {
  return isAdmin(roles);
};

/**
 * Check if user can manage users (admins only)
 */
export const canManageUsers = (roles: string[]): boolean => {
  return isAdmin(roles);
};

/**
 * Check if user can access admin pages (admins only)
 */
export const canAccessAdmin = (roles: string[]): boolean => {
  return isAdmin(roles);
};

/**
 * Check if user can access organizer pages (anyone with Organizer role)
 */
export const canAccessOrganizer = (roles: string[]): boolean => {
  return isOrganizer(roles);
};



