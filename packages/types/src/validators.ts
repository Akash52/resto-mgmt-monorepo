import { z } from 'zod';

// Zod validators for runtime validation
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.date(),
});

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  completed: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
  completed: z.boolean().default(false),
  userId: z.string().uuid(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

// Restaurant validation schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  description: z.string().max(1000).optional(),
  address: z.string().min(1, 'Address is required').max(500),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z.string().email('Valid email is required'),
  defaultTaxRate: z.number().min(0).max(1).optional(),
  taxInclusive: z.boolean().optional(),
  pricingStrategy: z.string().optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().min(1).max(500).optional(),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().optional(),
});

// Menu item validation schemas
export const createMenuItemSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(200),
  description: z.string().max(1000).optional(),
  basePrice: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  taxCategory: z.string().max(100).optional(),
  isAvailable: z.boolean().optional().default(true),
  imageUrl: z.string().url().optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  basePrice: z.number().min(0).optional(),
  category: z.string().min(1).max(100).optional(),
  taxCategory: z.string().max(100).optional(),
  isAvailable: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

// Export types inferred from schemas
export type UserSchema = z.infer<typeof userSchema>;
export type TaskSchema = z.infer<typeof taskSchema>;
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type CreateRestaurantSchema = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantSchema = z.infer<typeof updateRestaurantSchema>;
export type CreateMenuItemSchema = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemSchema = z.infer<typeof updateMenuItemSchema>;
