/**
 * TypeScript type definitions for Bookify database schema
 * Generated from bookify_mock_db.json
 */

export interface User {
  user_id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  address: string;
  profile_picture: string;
  added_on: string;
  updated_on: string;
  is_banned: boolean;
  loyalty_points: number;
}

export interface Organization {
  organization_id: number;
  name: string;
  description: string;
  contact_email: string;
  phone_number: string;
  address: string;
  added_on: string;
  updated_on: string;
  is_banned: boolean;
  website_url: string;
}

export interface Category {
  category_id: number;
  name: string;
  description: string;
  added_on: string;
}

export interface Event {
  event_id: number;
  organization_id: number;
  category_id: number;
  title: string;
  description: string;
  location_name: string;
  location_address: string;
  event_images: string[];
  event_time_stamp: string;
  capacity: number;
  status: 'active' | 'inactive' | 'cancelled';
  age_restriction: number;
  created_on: string;
  updated_on: string;
}

export interface Ticket {
  event_id: number;
  ticket_type: string;
  price: number;
  availability: boolean;
  limit_per_user: number;
  amount_available: number;
  amount_sold: number;
  discount: number;
  seats_description: string;
  is_refundable: boolean;
  created_on: string;
}

export interface Shop {
  event_id: number;
  shop_id: number;
  name: string;
  description: string;
  created_date: string;
  shop_banner_image: string;
  status: 'active' | 'inactive';
}

export interface Product {
  product_id: number;
  shop_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  limit_per_user: number;
  discount: number;
  created_on: string;
  updated_on: string;
}

export interface Store {
  store_id: number;
  name: string;
  description: string;
  created_date: string;
  banner_image: string;
}

export interface Cart {
  cart_id: number;
  user_id: number;
  created_date: string;
  update_date: string;
}

export interface CartItem {
  cart_id: number;
  cart_item_id: number;
  item_type: 'ticket' | 'product';
  event_id: number | null;
  ticket_type: string | null;
  product_id: number | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  added_on: string;
}

export interface Order {
  order_id: number;
  user_id: number;
  order_date: string;
  points_earned: number;
  shipping_address: string;
  discount_applied: number;
}

export interface OrderItem {
  order_id: number;
  item_type: 'ticket' | 'product';
  event_id: number | null;
  ticket_type: string | null;
  product_id: number | null;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_date: string;
  total_amount: number;
  method: 'credit_card' | 'debit_card' | 'digital_wallet';
  status: 'completed' | 'pending' | 'failed';
  transaction_reference: string;
}

export interface Review {
  review_id: number;
  user_id: number;
  event_id: number | null;
  product_id: number | null;
  review_type: 'event' | 'product';
  rating: number;
  comment: string;
  added_on: string;
  updated_on: string;
  is_deleted: boolean;
}

export interface Reward {
  reward_id: number;
  reward_type: 'discount' | 'free_ticket' | 'free_product';
  description: string;
  points_required: number;
  expiration_date: string;
  ticket_type: string | null;
  product_id: number | null;
  event_id?: number | null;
}

export interface Redemption {
  redemption_id: number;
  user_id: number;
  reward_id: number;
  redemption_date: string;
  points_spent: number;
}

export interface OrganizationUser {
  user_id: number;
  organization_id: number;
  role: 'organizer';
}

export type UserRole = 'unauthenticated' | 'user' | 'organization' | 'admin';

export interface AuthUser extends User {
  role: UserRole;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Filter types
export interface EventFilters {
  category_id?: number;
  organization_id?: number;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'date' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  shop_id?: number;
  event_id?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price' | 'newest' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ShopFilters {
  organization_id?: number;
  status?: 'active' | 'inactive';
  search?: string;
}
