import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  taxCategory: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useMenuItems(restaurantId: string | null) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get<MenuItem[]>(`/menu/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<MenuItem> & { restaurantId: string }) => {
      const { data } = await apiClient.post<MenuItem>('/menu', item);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', variables.restaurantId] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      restaurantId,
      ...item
    }: Partial<MenuItem> & { id: string; restaurantId: string }) => {
      const { data } = await apiClient.put<MenuItem>(`/menu/${id}`, item);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', variables.restaurantId] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      await apiClient.delete(`/menu/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', variables.restaurantId] });
    },
  });
}
