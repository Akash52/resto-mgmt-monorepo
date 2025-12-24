import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Restaurant APIs
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getBySlug: (slug: string) => api.get(`/restaurants/${slug}`),
};

// Menu APIs
export const menuAPI = {
  getByRestaurant: (restaurantId: string, category?: string) =>
    api.get(`/menu/${restaurantId}`, { params: { category } }),
  getItem: (id: string) => api.get(`/menu/item/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  preview: (data: any) => api.post('/orders/preview', data),
  getByOrderNumber: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
  getByRestaurant: (restaurantId: string, status?: string) =>
    api.get(`/orders/restaurant/${restaurantId}`, { params: { status } }),
};

// Coupon APIs
export const couponAPI = {
  validate: (restaurantId: string, code: string) =>
    api.post('/coupons/validate', { restaurantId, code }),
};

export default api;
