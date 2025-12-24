import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  billingConfig?: {
    id: string;
    restaurantId: string;
    defaultTaxRate: number;
    taxInclusive: boolean;
    pricingStrategy: string;
    allowCoupons: boolean;
    allowItemDiscounts: boolean;
    maxDiscountPercent: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      console.log('🔍 useRestaurants: Fetching restaurants...');
      const { data } = await apiClient.get<Restaurant[]>('/restaurants');
      console.log('✅ useRestaurants: Got restaurants:', data);
      return data;
    },
  });
}

export function useRestaurant(slug: string | null) {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await apiClient.get<Restaurant>(`/restaurants/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      restaurant: Partial<Restaurant> & {
        name: string;
        slug: string;
        address: string;
        phone: string;
        email: string;
        defaultTaxRate?: number;
        taxInclusive?: boolean;
        pricingStrategy?: string;
      }
    ) => {
      const { data } = await apiClient.post<Restaurant>('/restaurants', restaurant);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...restaurant }: Partial<Restaurant> & { id: string }) => {
      const { data } = await apiClient.put<Restaurant>(`/restaurants/${id}`, restaurant);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}
