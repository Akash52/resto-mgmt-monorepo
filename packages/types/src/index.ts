// Shared types across the monorepo
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
