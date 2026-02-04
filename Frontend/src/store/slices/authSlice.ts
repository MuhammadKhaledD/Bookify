import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from "jwt-decode";

export type RoleName = "User" | "Organizer" | "Admin";

interface JwtPayload {
  roles: string[];
  exp?: number;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  name?: string;
  address?: string;
  profilePicture?: string;
  emailConfirmed?: boolean;
  loyaltyPoints?: number;
  organizationId?: number;
  roles?: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  roles: string[];
  loading: boolean;
}

const getRolesFromToken = (token: string | null): string[] => {
  if (!token) return [];
  try {
    const decoded = jwtDecode<any>(token); // Use 'any' to access any claim
    console.log("🔍 Decoded JWT:", decoded);

    // Try multiple possible claim names for roles
    // ASP.NET Core uses these standard claim types
    let roles: string[] = [];

    // Try standard 'roles' claim (common in many JWTs)
    if (decoded.roles) {
      roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    }
    // Try 'role' (singular)
    else if (decoded.role) {
      roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
    }
    // Try ASP.NET standard claim type
    else if (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) {
      const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    }

    console.log("✅ Extracted roles:", roles);
    return roles;
  } catch (error) {
    console.error("❌ Failed to decode token", error);
    return [];
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: localStorage.getItem('access_token'),
  user: (() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  })(),
  // Derive roles from the initial token
  roles: getRolesFromToken(localStorage.getItem('access_token')),
  loading: false,
};

// Check if we have a token, set authenticated state
if (initialState.accessToken) {
  // Verify if token is expired? jwtDecode has exp but we are not checking it here yet.
  // Ideally we should check expiration too.
  initialState.isAuthenticated = true;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user?: User }>) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.roles = getRolesFromToken(action.payload.accessToken);

      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }

      localStorage.setItem('access_token', action.payload.accessToken);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.roles = [];
      localStorage.removeItem('access_token');
      localStorage.removeItem('token'); // Just in case
      localStorage.removeItem('user');
      localStorage.removeItem('user_roles'); // Clean up old data
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

