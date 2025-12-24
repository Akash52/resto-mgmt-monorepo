import { Router } from 'express';
import { prisma } from '@demo/database';
import { createMenuItemSchema, updateMenuItemSchema } from '@demo/types/validators';

export const menuRouter = Router();

// Get menu items for a restaurant
menuRouter.get('/:restaurantId', async (req, res) => {
  try {
    const { category } = req.query;
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: req.params.restaurantId,
        ...(category && { category: category as string }),
      },
      orderBy: { category: 'asc' },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get single menu item
menuRouter.get('/item/:id', async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item (Admin)
menuRouter.post('/', async (req, res) => {
  try {
    // Validate request body
    const validatedData = createMenuItemSchema.parse(req.body);

    const menuItem = await prisma.menuItem.create({
      data: validatedData,
    });
    res.status(201).json(menuItem);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
menuRouter.put('/:id', async (req, res) => {
  try {
    // Validate request body
    const validatedData = updateMenuItemSchema.parse(req.body);

    const menuItem = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: validatedData,
    });
    res.json(menuItem);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
menuRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.menuItem.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});
