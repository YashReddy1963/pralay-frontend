// API service for connecting with Django backend
import { User } from '../types/user.ts';

// Get backend URL from environment or URL parameters
const getBackendURL = () => {
  // Check if we're running in browser
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const backendParam = urlParams.get('backend');
    
    if (backendParam) {
      return decodeURIComponent(backendParam);
    }
    
    // If accessing from external device (not localhost), use the current host
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If not localhost, construct backend URL using the same host but port 8000
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      return `http://${currentHost}:8000`;
    }
  }
  
  // Fallback to environment variable or default
  return import.meta.env.VITE_BACKEND_URL || 'https://pralay-backend-1.onrender.com';
};

const API_BASE_URL = getBackendURL();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  state?: string;
  district?: string;
  nagar_panchayat?: string;
  village?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  refresh_token?: string;
  message: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || getBackendURL();
  }

  // Method to update the base URL dynamically
  updateBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
  }

  // Method to get current base URL
  getBaseURL() {
    return this.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if the request body is FormData
    const isFormData = options.body instanceof FormData;

    const defaultHeaders: Record<string, string> = {
      // Set Content-Type ONLY if it's NOT FormData (browser handles multipart/form-data)
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }), 
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': this.getCsrfToken(),
    };

    // Note: We're using session-based authentication (cookies), not Bearer tokens
    // The token is stored but not sent in headers - Django handles authentication via sessions
    const token = this.getAuthToken();
    if (token) {
      console.log('🔐 API Service: Token available but using session auth for', endpoint);
    } else {
      console.log('🔐 API Service: No auth token available for', endpoint);
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Always include cookies for session authentication
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && retryOnAuth && this.getRefreshToken()) {
        try {
          await this.refreshToken();
          // Retry the original request with new token
          return this.request<T>(endpoint, options, false);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          this.clearAuth();
          window.location.href = '/';
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // 🛑 CRITICAL PRE-STEP: Clear any potentially invalid or stale tokens/sessions
    this.clearAuth();
    
    const response = await this.request<AuthResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('🔐 LOGIN RESPONSE:', response);
    
    // Store user data in localStorage for frontend state management
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ User stored in localStorage');
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        console.log('✅ Auth token stored in localStorage');
        console.log('🔐 Token value:', response.token.substring(0, 20) + '...');
        
        // Verify token was stored correctly
        const storedToken = localStorage.getItem('authToken');
        console.log('🔐 Verification - stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'NOT FOUND');
      } else {
        console.log('❌ No token in response');
      }
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
        console.log('✅ Refresh token stored in localStorage');
      }
    } else {
      console.log('❌ No user in response');
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      // Call backend logout endpoint to clear session and revoke refresh token
      await this.request('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear localStorage
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  // OTP methods
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me/');
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users/');
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/api/users/${id}/`);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/api/users/${id}/`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('🔐 getAuthToken called:', token ? `Found token (${token.substring(0, 20)}...)` : 'No token found');
    return token;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  clearAuth(): void {
    console.log('🔐 clearAuth() called - clearing all auth data');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🔐 Auth data cleared from localStorage');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private getCsrfToken(): string {
    // Get CSRF token from cookies or meta tag
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
  }

  async fetchCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/csrf-token/`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.csrf_token;
      }
      return '';
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return '';
    }
  }

  async getOfficials(): Promise<any> {
    return this.request('/api/officials/', {
      method: 'GET',
    });
  }

  async getAuthorityTeamMembers(): Promise<any> {
    return this.request('/api/authority/team-members/', {
      method: 'GET',
    });
  }

  async getAuthoritySubAuthorities(): Promise<any> {
    return this.request('/api/authority/sub-authorities/', {
      method: 'GET',
    });
  }

  async removeTeamMember(memberId: number): Promise<any> {
    return this.request(`/api/authority/team-members/${memberId}/remove/`, {
      method: 'DELETE',
    });
  }

  async getOfficialActivity(officialId: number): Promise<any> {
    return this.request(`/api/officials/${officialId}/activity/`, {
      method: 'GET',
    });
  }

  async updateOfficialPermissions(officialId: number, permissions: {
    can_view_reports: boolean;
    can_approve_reports: boolean;
    can_manage_teams: boolean;
  }): Promise<any> {
    return this.request(`/api/officials/${officialId}/permissions/`, {
      method: 'POST',
      body: JSON.stringify(permissions),
    });
  }

  async getOfficialDetails(officialId: number): Promise<any> {
    return this.request(`/api/officials/${officialId}/details/`, {
      method: 'GET',
    });
  }

  // Sub-Authority Team Member Management
  async getSubAuthorityTeamMembers(): Promise<any> {
    return this.request('/api/sub-authority/team-members/', {
      method: 'GET',
    });
  }

  async createSubAuthorityTeamMember(formData: FormData): Promise<any> {
    // Rely on the standard this.request wrapper to handle:
    // 1. Authorization: Bearer token insertion.
    // 2. Skipping Content-Type: application/json because body is FormData.
    // 3. 401 token refresh and retry logic.
    return this.request('/api/sub-authority/create-team-member/', {
      method: 'POST',
      body: formData, // Pass FormData object directly
    });
  }

  async removeSubAuthorityTeamMember(memberId: number): Promise<any> {
    return this.request(`/api/sub-authority/team-members/${memberId}/remove/`, {
      method: 'DELETE',
    });
  }

  // Hazard Reports API methods
  async getHazardReports(filters?: {
    status?: string;
    hazard_type?: string;
    state?: string;
    district?: string;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const queryString = params.toString();
    return this.request(`/api/hazard-reports/${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  }

  async getMapHazardReports(filters?: {
    status?: string;
    hazard_type?: string;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const queryString = params.toString();
    return this.request(`/api/map-hazard-reports/${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  }

  async updateReportStatus(reportId: string, status: string, reviewNotes?: string, emergencyLevel?: string): Promise<any> {
    return this.request('/api/update-report-status/', {
      method: 'POST',
      body: JSON.stringify({
        report_id: reportId,
        status,
        review_notes: reviewNotes,
        emergency_level: emergencyLevel
      }),
    });
  }

  async deleteHazardReport(reportId: string): Promise<any> {
    return this.request(`/api/hazard-reports/${reportId}/delete/`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateReports(reportIds: string[], status: string, reviewNotes?: string): Promise<any> {
    return this.request('/api/bulk-update-reports/', {
      method: 'POST',
      body: JSON.stringify({
        report_ids: reportIds,
        status,
        review_notes: reviewNotes
      }),
    });
  }

  async bulkDeleteReports(reportIds: string[]): Promise<any> {
    return this.request('/api/bulk-delete-reports/', {
      method: 'POST',
      body: JSON.stringify({
        report_ids: reportIds
      }),
    });
  }

  // User-specific reports API methods
  async getUserReports(): Promise<any> {
    return this.request('/api/hazard-reports/?user_reports=true', {
      method: 'GET',
    });
  }

  async getUserReportById(reportId: string): Promise<any> {
    // Use the existing endpoint with user_reports filter and then find the specific report
    const response = await this.request<{success: boolean, reports?: any[]}>('/api/hazard-reports/?user_reports=true&limit=1000', {
      method: 'GET',
    });
    
    if (response.success && response.reports) {
      const report = response.reports.find((r: any) => r.report_id === reportId);
      if (report) {
        return {
          success: true,
          report: report
        };
      } else {
        return {
          success: false,
          message: 'Report not found or access denied'
        };
      }
    }
    
    return response;
  }

  async testUserReports(): Promise<any> {
    return this.request('/api/test-user-reports/', {
      method: 'GET',
    });
  }

  async debugReports(): Promise<any> {
    return this.request('/api/debug-reports/', {
      method: 'GET',
    });
  }

  async testHazardReportsEndpoint(): Promise<any> {
    return this.request('/api/test-hazard-reports/?user_reports=true', {
      method: 'GET',
    });
  }

  async testEmailNotification(email: string): Promise<any> {
    return this.request('/api/test-email/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Public method for generic requests
  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
