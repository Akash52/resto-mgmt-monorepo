import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { randomUUID } from 'crypto';
import type { Task, ApiResponse } from '@demo/types';
import { createTaskSchema, updateTaskSchema } from '@demo/types/validators';

const router: ExpressRouter = Router();

// In-memory database (replace with real DB in production)
const tasks: Task[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Setup Turborepo',
    description: 'Initialize monorepo with Turborepo',
    completed: true,
    userId: 'cbe22397-c90a-41e4-87cc-f8d4d1610e88',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Create shared packages',
    description: 'Build UI and types packages',
    completed: false,
    userId: 'cbe22397-c90a-41e4-87cc-f8d4d1610e88',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

// GET /api/tasks - Get all tasks
router.get('/', (_req, res) => {
  const response: ApiResponse<Task[]> = {
    success: true,
    data: tasks,
  };
  res.json(response);
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Task not found',
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Task> = {
    success: true,
    data: task,
  };
  res.json(response);
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  try {
    // Validate with Zod schema from shared package
    const validatedData = createTaskSchema.parse(req.body);

    const newTask: Task = {
      id: randomUUID(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);

    const response: ApiResponse<Task> = {
      success: true,
      data: newTask,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Validation failed',
    };
    res.status(400).json(response);
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', (req, res) => {
  try {
    const validatedData = updateTaskSchema.parse(req.body);
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

    if (taskIndex === -1) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return res.status(404).json(response);
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...validatedData,
      updatedAt: new Date(),
    };

    const response: ApiResponse<Task> = {
      success: true,
      data: tasks[taskIndex],
    };
    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Validation failed',
    };
    res.status(400).json(response);
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

  if (taskIndex === -1) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Task not found',
    };
    return res.status(404).json(response);
  }

  tasks.splice(taskIndex, 1);

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Task deleted successfully' },
  };
  res.json(response);
});

export { router as tasksRouter };
