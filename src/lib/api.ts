// Laravel API Service
// Update this URL to your Laravel backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    
    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const api = new ApiService();

// Student API
export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade?: string;
  section?: string;
  contact_number?: string;
  guardian_name?: string;
  guardian_contact?: string;
  email?: string;
  password?: string;
}

export const studentApi = {
  getAll: () => api.get<Student[]>('/students'),
  create: (data: Omit<Student, 'id'>) => api.post<Student>('/students', data),
  update: (id: string, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),
  delete: (id: string) => api.delete<void>(`/students/${id}`),
};

// Attendance API
export interface AttendanceRecord {
  id?: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  time_in?: string;
  notes?: string;
}

export const attendanceApi = {
  getByDate: (date: string) => api.get<AttendanceRecord[]>(`/attendance?date=${date}`),
  save: (records: AttendanceRecord[]) => api.post<void>('/attendance', { records }),
};

// Auth API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    role: 'admin' | 'student';
  };
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => api.post<LoginResponse>('/login', credentials),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('studentId');
  },
};
