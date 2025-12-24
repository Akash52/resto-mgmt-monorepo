import { Router } from 'express';
import { prisma } from '@demo/database';

export const rulesRouter = Router();

// ========== PRICING RULES ==========

// Get pricing rules for a restaurant
rulesRouter.get('/pricing/:restaurantId', async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: { priority: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// Create pricing rule
rulesRouter.post('/pricing', async (req, res) => {
  try {
    const rule = await prisma.pricingRule.create({
      data: {
        restaurantId: req.body.restaurantId,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        priority: req.body.priority || 0,
        conditions: req.body.conditions,
        action: req.body.action,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      },
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// Update pricing rule
rulesRouter.put('/pricing/:id', async (req, res) => {
  try {
    const rule = await prisma.pricingRule.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        priority: req.body.priority,
        conditions: req.body.conditions,
        action: req.body.action,
        isActive: req.body.isActive,
      },
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// Delete pricing rule
rulesRouter.delete('/pricing/:id', async (req, res) => {
  try {
    await prisma.pricingRule.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Pricing rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

// ========== TAX RULES ==========

// Get tax rules for a restaurant
rulesRouter.get('/tax/:restaurantId', async (req, res) => {
  try {
    const rules = await prisma.taxRule.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: { priority: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tax rules' });
  }
});

// Create tax rule
rulesRouter.post('/tax', async (req, res) => {
  try {
    const rule = await prisma.taxRule.create({
      data: {
        restaurantId: req.body.restaurantId,
        name: req.body.name,
        description: req.body.description,
        rate: req.body.rate,
        applicationType: req.body.applicationType || 'PERCENTAGE',
        priority: req.body.priority || 0,
        conditions: req.body.conditions,
        isCompound: req.body.isCompound || false,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      },
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tax rule' });
  }
});

// Update tax rule
rulesRouter.put('/tax/:id', async (req, res) => {
  try {
    const rule = await prisma.taxRule.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        rate: req.body.rate,
        applicationType: req.body.applicationType,
        priority: req.body.priority,
        conditions: req.body.conditions,
        isCompound: req.body.isCompound,
        isActive: req.body.isActive,
      },
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tax rule' });
  }
});

// Delete tax rule
rulesRouter.delete('/tax/:id', async (req, res) => {
  try {
    await prisma.taxRule.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Tax rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tax rule' });
  }
});

// ========== DISCOUNT RULES ==========

// Get discount rules for a restaurant
rulesRouter.get('/discount/:restaurantId', async (req, res) => {
  try {
    const rules = await prisma.discountRule.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: { priority: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discount rules' });
  }
});

// Create discount rule
rulesRouter.post('/discount', async (req, res) => {
  try {
    const rule = await prisma.discountRule.create({
      data: {
        restaurantId: req.body.restaurantId,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        maxDiscount: req.body.maxDiscount,
        priority: req.body.priority || 0,
        conditions: req.body.conditions,
        usageLimit: req.body.usageLimit,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      },
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create discount rule' });
  }
});

// Update discount rule
rulesRouter.put('/discount/:id', async (req, res) => {
  try {
    const rule = await prisma.discountRule.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        maxDiscount: req.body.maxDiscount,
        priority: req.body.priority,
        conditions: req.body.conditions,
        usageLimit: req.body.usageLimit,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isActive: req.body.isActive,
      },
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update discount rule' });
  }
});

// Delete discount rule
rulesRouter.delete('/discount/:id', async (req, res) => {
  try {
    await prisma.discountRule.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Discount rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discount rule' });
  }
});
