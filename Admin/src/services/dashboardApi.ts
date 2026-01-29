const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const dashboardApi = {
    getDashboardData: async () => {
        const response = await fetch('/api/dashboard', {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(data.message || 'Failed to fetch dashboard data');
        }
        return data.data;
    }
};
