import { Router } from 'express';
import { prisma } from '@demo/database';
import { createRestaurantSchema, updateRestaurantSchema } from '@demo/types/validators';

export const restaurantRouter = Router();

// Get all restaurants
restaurantRouter.get('/', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by slug
restaurantRouter.get('/:slug', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: req.params.slug },
      include: {
        billingConfig: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Create restaurant (Admin)
restaurantRouter.post('/', async (req, res) => {
  try {
    // Validate request body
    const validatedData = createRestaurantSchema.parse(req.body);

    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        address: validatedData.address,
        phone: validatedData.phone,
        email: validatedData.email,
        billingConfig: {
          create: {
            defaultTaxRate: validatedData.defaultTaxRate || 0,
            taxInclusive: validatedData.taxInclusive || false,
            pricingStrategy: validatedData.pricingStrategy || 'STANDARD',
          },
        },
      },
      include: {
        billingConfig: true,
      },
    });
    res.status(201).json(restaurant);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Restaurant with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant
restaurantRouter.put('/:id', async (req, res) => {
  try {
    // Validate request body
    const validatedData = updateRestaurantSchema.parse(req.body);

    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: validatedData,
    });
    res.json(restaurant);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// Delete restaurant
restaurantRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.restaurant.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});
