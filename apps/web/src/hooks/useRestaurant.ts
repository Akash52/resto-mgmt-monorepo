import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantAPI, menuAPI, orderAPI, couponAPI } from '../lib/api';

// Restaurant hooks
export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const response = await restaurantAPI.getAll();
      return response.data;
    },
  });
};

export const useRestaurant = (slug: string) => {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const response = await restaurantAPI.getBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
  });
};

// Menu hooks
export const useMenu = (restaurantId: string, category?: string) => {
  return useQuery({
    queryKey: ['menu', restaurantId, category],
    queryFn: async () => {
      const response = await menuAPI.getByRestaurant(restaurantId, category);
      return response.data;
    },
    enabled: !!restaurantId,
  });
};

// Order hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await orderAPI.create(orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrderPreview = () => {
  return useMutation({
    mutationFn: async (previewData: any) => {
      const response = await orderAPI.preview(previewData);
      return response.data;
    },
  });
};

export const useOrder = (orderNumber: string) => {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await orderAPI.getByOrderNumber(orderNumber);
      return response.data;
    },
    enabled: !!orderNumber,
  });
};

// Coupon hooks
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ restaurantId, code }: { restaurantId: string; code: string }) => {
      const response = await couponAPI.validate(restaurantId, code);
      return response.data;
    },
  });
};
