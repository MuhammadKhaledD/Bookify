import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store/store';
import { setCredentials, logout } from '@/store/slices/authSlice';

// Create axios instance with base configuration
// Use the Azure backend URL directly - CORS is enabled on the backend
const api = axios.create({
  baseURL: "https://bookifyapi-ebdzebe4cxbbexga.germanywestcentral-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ⭐ REQUIRED - Send cookies with requests
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const urlPath = config.url || "";

    // For public auth endpoints like login/register/confirm-email,
    // do NOT send Authorization header to keep requests simple
    const publicAuthPaths = ["/auth/login", "/auth/register", "/auth/confirm-email"];
    if (publicAuthPaths.some((path) => urlPath.startsWith(path))) {
      console.log(
        "Public auth request (no Authorization header):",
        config.method?.toUpperCase(),
        api.defaults.baseURL + urlPath
      );
      return config;
    }

    // Log the full URL being called for debugging
    console.log("API Request:", config.method?.toUpperCase(), api.defaults.baseURL + urlPath);

    // Get token from Redux store or localStorage
    const state = store.getState();
    const token = state.auth.accessToken || localStorage.getItem("access_token") || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request header");
      console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No token found! Token will NOT be sent in request.");
      console.log("Redux state.auth.accessToken:", state.auth.accessToken);
      console.log("localStorage access_token:", localStorage.getItem("access_token"));
      console.log("localStorage token:", localStorage.getItem("token"));
    }

    // Log headers for non-OPTIONS requests
    if (config.method?.toUpperCase() !== "OPTIONS") {
      console.log("Request headers:", {
        Authorization: config.headers.Authorization ? "Bearer [TOKEN]" : "NOT SET",
        "Content-Type": config.headers["Content-Type"],
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    // Skip refresh if this is already a refresh token request to avoid infinite loops
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token (with credentials to send cookies)
        const refreshResponse = await api.post(
          "/auth/refresh-token",
          {}
        );

        const newAccessToken = refreshResponse.data.accessToken || refreshResponse.data.access_token;

        if (newAccessToken) {
          // Update Redux store with new token
          store.dispatch(setCredentials({ accessToken: newAccessToken }));

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logout());

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions to fetch data for dropdowns
export const fetchProducts = async () => {
  const response = await api.get('/events/products');
  return response.data;
};

export const fetchTickets = async () => {
  // First, get all events
  const eventsResponse = await api.get('/Events');
  const events = eventsResponse.data;

  // Then, fetch tickets for each event
  const allTickets: any[] = [];
  for (const event of events) {
    try {
      const ticketsResponse = await api.get(`/Tickets/event/${event.id}`);
      const tickets = ticketsResponse.data.map((ticket: any) => ({
        ...ticket,
        eventTitle: event.title // Add event title for display
      }));
      allTickets.push(...tickets);
    } catch (error) {
      console.error(`Failed to fetch tickets for event ${event.id}:`, error);
    }
  }

  return allTickets;
};

export const fetchShops = async () => {
  // First, get all events
  const eventsResponse = await api.get('/Events');
  const events = eventsResponse.data;

  // Then, fetch shop for each event
  const allShops: any[] = [];
  for (const event of events) {
    try {
      const shopResponse = await api.get(`/shops/event/${event.id}`);
      if (shopResponse.data) {
        allShops.push(shopResponse.data);
      }
    } catch (error) {
      console.error(`Failed to fetch shop for event ${event.id}:`, error);
    }
  }

  return allShops;
};

export const fetchStores = async () => {
  // First, get all organizations
  const orgsResponse = await api.get('/organizations');
  const organizations = orgsResponse.data;

  // Then, fetch store for each organization
  const allStores: any[] = [];
  for (const org of organizations) {
    try {
      const storeResponse = await api.get(`/stores/by-org/${org.id}`);
      if (storeResponse.data) {
        allStores.push(storeResponse.data);
      }
    } catch (error) {
      console.error(`Failed to fetch store for org ${org.id}:`, error);
    }
  }

  return allStores;
};

// Statistics API Endpoints
export const statsApi = {
  getOrgEarnings: async () => {
    const response = await api.get('/Analytics/org-earnings');
    return response.data;
  },
  getEventAttendance: async () => {
    const response = await api.get('/Analytics/event-attendance');
    return response.data;
  },
  getUserActivity: async () => {
    const response = await api.get('/Analytics/user-activity');
    return response.data;
  },
  getUserPayments: async () => {
    const response = await api.get('/Analytics/user-payments');
    return response.data;
  },
  getTopEvents: async () => {
    const response = await api.get('/Analytics/top-events');
    return response.data;
  },
  getUserLoyalty: async () => {
    const response = await api.get('/Analytics/user-loyalty');
    return response.data;
  },
  getOrgRevenueBreakdown: async () => {
    const response = await api.get('/Analytics/org-revenue-breakdown');
    return response.data;
  },
  getUserEngagement: async () => {
    const response = await api.get('/Analytics/user-engagement');
    return response.data;
  }
};

// Category Management API
export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (id: number, data: { name: string; description: string }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Organization Management API
export const organizationApi = {
  getAll: async () => {
    const response = await api.get('/organizations');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string; contactEmail?: string; contactPhone?: string; address?: string }) => {
    const response = await api.post('/organizations', data);
    return response.data;
  },
  update: async (id: number, data: { name: string; description?: string; contactEmail?: string; contactPhone?: string; address?: string }) => {
    const response = await api.put(`/organizations/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  }
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

// Rewards Management API
export const rewardsApi = {
  getAll: async () => {
    const response = await api.get('/rewards');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/rewards/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    pointsRequired: number;
    rewardType: string;
    discount?: number;
    expireDate: string;
    status: boolean;
    itemProductId?: number | null;
    itemTicketId?: number | null;
  }) => {
    const response = await api.post('/rewards', data);
    return response.data;
  },
  update: async (id: number, data: {
    name: string;
    description?: string;
    pointsRequired: number;
    rewardType: string;
    discount?: number;
    expireDate: string;
    status: boolean;
    itemProductId?: number | null;
    itemTicketId?: number | null;
  }) => {
    const response = await api.put(`/rewards/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/rewards/${id}`);
    return response.data;
  }
};

// Events Management API
export const eventsApi = {
  getAll: async () => {
    const response = await api.get('/Events');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/Events/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/Events', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/Events/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/Events/${id}`);
    return response.data;
  }
};

// Products Management API
export const productsApi = {
  getAll: async () => {
    const response = await api.get('/events/products');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/events/products/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/events/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/events/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/events/products/${id}`);
    return response.data;
  }
};

// Tickets Management API
export const ticketsApi = {
  getAll: async () => {
    const response = await api.get('/Tickets');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/Tickets/${id}`);
    return response.data;
  },
  getByEventId: async (eventId: number) => {
    const response = await api.get(`/Tickets/event/${eventId}`);
    return response.data;
  },
  create: async (data: {
    eventId: number;
    ticketType: string;
    price: number;
    quantityAvailable: number;
    limitPerUser?: number;
    discount?: number;
    isRefundable?: boolean;
    pointsEarnedPerUnit?: number;
    seatsDescription?: string;
  }) => {
    const response = await api.post('/Tickets', data);
    return response.data;
  },
  update: async (id: number, data: {
    ticketType: string;
    price: number;
    quantityAvailable: number;
    limitPerUser?: number;
    discount?: number;
    isRefundable?: boolean;
    pointsEarnedPerUnit?: number;
    seatsDescription?: string;
  }) => {
    const response = await api.put(`/Tickets/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/Tickets/${id}`);
    return response.data;
  }
};

// Analytics API - TypeScript Interfaces
export interface DashboardStats {
  total_organizations: number;
  total_admins: number;
  total_organizers: number;
  total_users: number;
  total_events: number;
  total_tickets_sold: number;
  total_products_sold: number;
  top_product_id: number;
  top_product_name: string;
  top_product_sold: number;
  top_event_id: number;
  top_event_title: string;
  top_event_tickets_sold: number;
}

export interface OrgRevenue {
  org_id: number;
  org_name: string;
  ticket_revenue: number;
  shop_revenue: number;
  store_revenue: number;
  total_revenue: number;
}

export interface EventAttendance {
  event_id: number;
  event_title: string;
  tickets_sold: number;
}

export interface TopEvent {
  event_id: number;
  event_title: string;
  revenue: number;
}

export interface UserActivity {
  total_users: number;
  active_users: number;
}

export interface UserPayment {
  user_id: string;
  user_name: string;
  total_paid: number;
}

export interface UserLoyalty {
  user_id: string;
  user_name: string;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
}

export interface UserEngagement {
  user_id: string;
  user_name: string;
  events_attended: number;
  products_purchased: number;
  reviews_written: number;
  loyalty_points: number;
  engagement_score: number;
}

// Analytics API Endpoints
export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/Analytics/dashboard-stats');
    return response.data;
  },

  getOrgRevenue: async (): Promise<OrgRevenue[]> => {
    const response = await api.get('/Analytics/org-revenue-breakdown');
    return response.data;
  },

  getEventAttendance: async (): Promise<EventAttendance[]> => {
    const response = await api.get('/Analytics/event-attendance');
    return response.data;
  },

  getTopEvents: async (): Promise<TopEvent[]> => {
    const response = await api.get('/Analytics/top-events');
    return response.data;
  },

  getUserActivity: async (): Promise<UserActivity> => {
    const response = await api.get('/Analytics/user-activity');
    return response.data;
  },

  getUserPayments: async (): Promise<UserPayment[]> => {
    const response = await api.get('/Analytics/user-payments');
    return response.data;
  },

  getUserLoyalty: async (): Promise<UserLoyalty[]> => {
    const response = await api.get('/Analytics/user-loyalty');
    return response.data;
  },

  getUserEngagement: async (): Promise<UserEngagement[]> => {
    const response = await api.get('/Analytics/user-engagement');
    return response.data;
  },
};

// Users API - For organizer organization management
export interface OrganizerOrganization {
  id: number;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
}

export const usersApi = {
  getOrganizerOrganizations: async (): Promise<OrganizerOrganization[]> => {
    const response = await api.get('/admin/users/organizerOrgnizations');
    return response.data;
  },
};

// Auth API - Password management and profile
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

export interface EditProfileRequest {
  userName?: string;
  name?: string;
  address?: string;
  profilePictureFile?: File;
}

export const authApi = {
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  resendConfirmation: async (data: ResendConfirmationRequest) => {
    const response = await api.post('/auth/resend-confirmation', data);
    return response.data;
  },

  editProfile: async (data: EditProfileRequest) => {
    const formData = new FormData();
    if (data.userName) formData.append('UserName', data.userName);
    if (data.name) formData.append('Name', data.name);
    if (data.address) formData.append('Address', data.address);
    if (data.profilePictureFile) formData.append('ProfilePictureFile', data.profilePictureFile);

    const response = await api.put('/auth/editprofile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Review types
export type Review = {
  reviewId: number;
  userId: string;
  userName: string;
  eventId?: number | null;
  productId?: number | null;
  reviewType: string;
  rating: number;
  comment: string;
};

export type CreateReviewRequest = {
  userId: string;
  eventId?: number;
  productId?: number;
  reviewType: string;
  rating: number;
  comment: string;
};

export type UpdateReviewRequest = {
  userId: string;
  rating: number;
  comment: string;
};

// Review API Endpoints
export const reviewApi = {
  // Create a review (event OR product, not both)
  create: async (data: CreateReviewRequest) => {
    const response = await api.post('/Review', data);
    return response.data;
  },

  // Get review by ID
  getById: async (id: number) => {
    const response = await api.get(`/Review/${id}`);
    return response.data;
  },

  // Update review
  update: async (id: number, data: UpdateReviewRequest) => {
    const response = await api.put(`/Review/${id}`, data);
    return response.data;
  },

  // Delete review
  delete: async (id: number) => {
    const response = await api.delete(`/Review/${id}`);
    return response.data;
  },

  // Get reviews for an event
  getEventReviews: async (eventId: number) => {
    const response = await api.get(`/Review/event/${eventId}`);
    return response.data;
  },

  // Get reviews for a product
  getProductReviews: async (productId: number) => {
    const response = await api.get(`/Review/product/${productId}`);
    return response.data;
  },
};

// User Management API
export interface User {
  id: string;
  userName: string;
  email: string;
  name?: string;
  roles: string[];
  isBanned: boolean;
  createdOn: string;
  lastLogin?: string;
  profilePictureUrl?: string;
  address?: string;
}

export interface Role {
  roleId: string;
  roleName: string;
}

export const roleApi = {
  // Get all available roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/role/GetAllRoles');
    return response.data?.data || response.data || [];
  },

  // Get single role by ID
  getRoleById: async (roleId: string): Promise<Role> => {
    const response = await api.get(`/role/GetRoleById/${roleId}`);
    return response.data?.data || response.data;
  },

  // Get all users in a specific role
  getUsersInRole: async (roleId: string): Promise<any> => {
    const response = await api.get(`/role/GetUsersInRole/${roleId}`);
    return response.data?.data || response.data;
  },

  // Add single user to role
  addUserToRole: async (userId: string, roleId: string, organizationId?: string): Promise<any> => {
    const response = await api.post('/role/AddUserToRole', {
      UserId: userId,
      RoleId: roleId,
      ...(organizationId && { OrganizationId: organizationId }),
    });
    return response.data;
  },

  // Remove user from role
  removeUserFromRole: async (userId: string, roleId: string): Promise<any> => {
    const response = await api.post('/role/RemoveUserFromRole', {
      UserId: userId,
      RoleId: roleId,
    });
    return response.data;
  },
};

export const userManagementApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data?.items || response.data || [];
  },

  // Get active users
  getActiveUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users/active');
    return response.data?.items || response.data || [];
  },

  // Get banned users
  getBannedUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users/banned');
    return response.data?.items || response.data || [];
  },

  // Get admin users
  getAdminUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users/admins');
    return response.data?.items || response.data || [];
  },

  // Get organizer users
  getOrganizerUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users/organizers');
    return response.data?.items || response.data || [];
  },

  // Get single user details
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user information
  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data?.data || response.data;
  },

  // Ban user
  banUser: async (userId: string): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/ban`);
    return response.data;
  },

  // Unban user
  unbanUser: async (userId: string): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Permanent deletion
  deleteUserPermanently: async (userId: string): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}/permanent`);
    return response.data;
  },

  // Get user statistics
  getUserStatistics: async (): Promise<any> => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },
};

export default api;

