import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface Order {
  id: string;
  restaurantId: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxAmount: number;
    discountAmount: number;
    menuItem?: {
      id: string;
      name: string;
      category: string;
      description?: string;
      basePrice: number;
    };
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  appliedPricingRules: string[];
  appliedTaxRules: string[];
  appliedDiscounts: string[];
  billingDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export function useOrders(restaurantId: string | null) {
  return useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      console.log('🌐 Fetching orders for restaurant:', restaurantId);
      const { data } = await apiClient.get<Order[]>(`/orders/restaurant/${restaurantId}`);
      console.log('📦 Orders received:', data.length, 'orders');
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<Order>(`/orders/id/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      restaurantId,
    }: {
      id: string;
      status: Order['status'];
      restaurantId: string;
    }) => {
      const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}
