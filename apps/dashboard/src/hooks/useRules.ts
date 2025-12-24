import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface PricingRule {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  type: 'HAPPY_HOUR' | 'LUNCH_SPECIAL' | 'WEEKEND_PRICING' | 'SEASONAL' | 'CUSTOM';
  conditions: any;
  action: any;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRule {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  applicationType: 'PERCENTAGE' | 'FIXED';
  rate: number;
  isCompound: boolean;
  conditions: any;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRule {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
  startDate?: string;
  endDate?: string;
  conditions: any;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  restaurantId: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  conditions: any;
  createdAt: string;
  updatedAt: string;
}

// Pricing Rules
export function usePricingRules(restaurantId: string | null) {
  return useQuery({
    queryKey: ['pricing-rules', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get<PricingRule[]>(`/rules/pricing/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<PricingRule>) => {
      const { data } = await apiClient.post<PricingRule>('/rules/pricing', rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules', variables.restaurantId] });
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rule }: Partial<PricingRule> & { id: string }) => {
      const { data } = await apiClient.put<PricingRule>(`/rules/pricing/${id}`, rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules', variables.restaurantId] });
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      await apiClient.delete(`/rules/pricing/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules', variables.restaurantId] });
    },
  });
}

// Tax Rules
export function useTaxRules(restaurantId: string | null) {
  return useQuery({
    queryKey: ['tax-rules', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get<TaxRule[]>(`/rules/tax/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateTaxRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<TaxRule>) => {
      const { data } = await apiClient.post<TaxRule>('/rules/tax', rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules', variables.restaurantId] });
    },
  });
}

export function useUpdateTaxRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rule }: Partial<TaxRule> & { id: string }) => {
      const { data } = await apiClient.put<TaxRule>(`/rules/tax/${id}`, rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules', variables.restaurantId] });
    },
  });
}

export function useDeleteTaxRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      await apiClient.delete(`/rules/tax/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules', variables.restaurantId] });
    },
  });
}

// Discount Rules
export function useDiscountRules(restaurantId: string | null) {
  return useQuery({
    queryKey: ['discount-rules', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get<DiscountRule[]>(`/rules/discount/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<DiscountRule>) => {
      const { data } = await apiClient.post<DiscountRule>('/rules/discount', rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discount-rules', variables.restaurantId] });
    },
  });
}

export function useUpdateDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rule }: Partial<DiscountRule> & { id: string }) => {
      const { data } = await apiClient.put<DiscountRule>(`/rules/discount/${id}`, rule);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discount-rules', variables.restaurantId] });
    },
  });
}

export function useDeleteDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      await apiClient.delete(`/rules/discount/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discount-rules', variables.restaurantId] });
    },
  });
}

// Coupons
export function useCoupons(restaurantId: string | null) {
  return useQuery({
    queryKey: ['coupons', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get<Coupon[]>(`/coupons/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Partial<Coupon>) => {
      const { data } = await apiClient.post<Coupon>('/coupons', coupon);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons', variables.restaurantId] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...coupon }: Partial<Coupon> & { id: string }) => {
      const { data } = await apiClient.put<Coupon>(`/coupons/${id}`, coupon);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons', variables.restaurantId] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await apiClient.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}
