export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  block_no: string;
  house_no: string;
  date_joined: string;
}

export interface Tool {
  id: number;
  name: string;
  image: string | null;
  image_url: string | null;
  category: string;
  condition: string;
  is_available: boolean;
  owner: User;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequest {
  id: number;
  tool: Tool;
  borrower: User;
  reason: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  return_date: string | null;
  created_at: string;
  updated_at: string;
  owner_notified: boolean;
  borrower_notified: boolean;
  is_overdue: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

export interface NotificationData {
  new_approvals: number;
  new_requests: number;
  total_notifications: number;
}

export interface Stats {
  total_tools?: number;
  total_users?: number;
  total_requests?: number;
  total_lent?: number;
  total_borrowed?: number;
  available_tools?: number;
  my_tools?: number;
  pending_requests?: number;
  approved_requests?: number;
  incoming_pending?: number;
}
