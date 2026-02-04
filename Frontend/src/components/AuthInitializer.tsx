import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout } from "@/store/slices/authSlice";
import api from "@/lib/api";

/**
 * Component to initialize auth state on app load
 * Checks if stored token is still valid and fetches user roles
 */
export const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we have a token, verify it's still valid by fetching user
      if (accessToken) {
        try {
          // Fetch user data
          const userResponse = await api.get("/auth/me");

          // Update user data if available
          if (userResponse.data) {
            dispatch(setCredentials({
              accessToken,
              user: userResponse.data,
            }));
          }
        } catch (error: any) {
          // Token is invalid, clear auth state
          if (error.response?.status === 401) {
            dispatch(logout());
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch, accessToken]);

  return null;
};
