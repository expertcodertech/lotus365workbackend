const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

let accessToken: string | null = null;

export function setToken(token: string | null) {
    accessToken = token;
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
}

export function getToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('admin_token');
    }
    return accessToken;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `API Error: ${res.status}`);
    return json.data ?? json;
}

// Auth
export const adminLogin = (phone: string, password: string) =>
    apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });

// Dashboard
export const getDashboard = () => apiFetch<any>('/admin/dashboard');

// Users
export const getUsers = (page = 1, limit = 20, search?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    return apiFetch<any>(`/admin/users?${params}`);
};
export const getUserDetail = (id: string) => apiFetch<any>(`/admin/users/${id}`);
export const updateUserStatus = (id: string, status: string) =>
    apiFetch<any>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

// Transactions
export const getTransactions = (page = 1, limit = 20, type?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    return apiFetch<any>(`/admin/transactions?${params}`);
};

// Withdrawals
export const getWithdrawals = (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return apiFetch<any>(`/admin/withdrawals?${params}`);
};
export const processWithdrawal = (id: string, action: 'approve' | 'reject', adminNote?: string) =>
    apiFetch<any>(`/admin/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify({ action, adminNote }) });

// Config
export const getConfigs = () => apiFetch<any>('/admin/config');
export const updateConfig = (key: string, value: any) =>
    apiFetch<any>(`/admin/config/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });

// Analytics
export const getAnalytics = (days = 7) => apiFetch<any>(`/admin/analytics?days=${days}`);
