import api from '../lib/axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLedger: (id) => api.get(`/products/${id}/ledger`),
  importCsv: (formData) => api.post('/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportCsvUrl: () => `${api.defaults.baseURL}/products/export`,
};

export const receiptsApi = {
  getAll: (params) => api.get('/receipts', { params }),
  getById: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  update: (id, data) => api.put(`/receipts/${id}`, data),
  validate: (id) => api.post(`/receipts/${id}/validate`),
  cancel: (id) => api.post(`/receipts/${id}/cancel`),
};

export const deliveriesApi = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  validate: (id) => api.post(`/deliveries/${id}/validate`),
  cancel: (id) => api.post(`/deliveries/${id}/cancel`),
};

export const transfersApi = {
  getAll: (params) => api.get('/transfers', { params }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  validate: (id) => api.post(`/transfers/${id}/validate`),
};

export const adjustmentsApi = {
  getAll: (params) => api.get('/adjustments', { params }),
  getById: (id) => api.get(`/adjustments/${id}`),
  create: (data) => api.post('/adjustments', data),
  validate: (id) => api.post(`/adjustments/${id}/validate`),
};

export const ledgerApi = {
  getAll: (params) => api.get('/ledger', { params }),
  exportCsvUrl: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return `${api.defaults.baseURL}/ledger/export?${q}`;
  },
};

export const dashboardApi = {
  getKpis: () => api.get('/dashboard/kpis'),
  getChart: (days = 7) => api.get(`/dashboard/chart?days=${days}`),
  getLowStock: () => api.get('/dashboard/low-stock'),
  getActivity: () => api.get('/dashboard/activity'),
  getAiSuggestions: () => api.get('/dashboard/ai-suggestions'),
};

export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const settingsApi = {
  getWarehouses: () => api.get('/settings/warehouses'),
  createWarehouse: (data) => api.post('/settings/warehouses', data),
  getLocations: (warehouseId) => api.get('/settings/locations', { params: { warehouseId } }),
  createLocation: (data) => api.post('/settings/locations', data),
  getCategories: () => api.get('/settings/categories'),
  createCategory: (data) => api.post('/settings/categories', data),
  getUOMs: () => api.get('/settings/uoms'),
  createUOM: (data) => api.post('/settings/uoms', data),
  getSuppliers: () => api.get('/settings/suppliers'),
  createSupplier: (data) => api.post('/settings/suppliers', data),
  getCustomers: () => api.get('/settings/customers'),
  createCustomer: (data) => api.post('/settings/customers', data),
};
