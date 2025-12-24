import type { Task, ApiResponse } from '@demo/types';

const API_BASE = '/api';

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE}/tasks`);
    const data: ApiResponse<Task[]> = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    const data: ApiResponse<Task> = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    const data: ApiResponse<Task> = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data: ApiResponse<Task> = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });

    const data: ApiResponse<{ message: string }> = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }
  },
};
