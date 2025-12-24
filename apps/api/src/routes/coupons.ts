import { Router } from 'express';
import { prisma } from '@demo/database';

export const couponRouter = Router();

// Get coupons for a restaurant
couponRouter.get('/:restaurantId', async (req, res) => {
  try {
    const { active } = req.query;
    const coupons = await prisma.coupon.findMany({
      where: {
        restaurantId: req.params.restaurantId,
        ...(active === 'true' && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Validate coupon
couponRouter.post('/validate', async (req, res) => {
  try {
    const { restaurantId, code } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId,
          code,
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Coupon not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, error: 'Coupon is inactive' });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ valid: false, error: 'Coupon not yet valid' });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({ valid: false, error: 'Coupon expired' });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        conditions: coupon.conditions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Create coupon
couponRouter.post('/', async (req, res) => {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        restaurantId: req.body.restaurantId,
        code: req.body.code.toUpperCase(),
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
        maxDiscount: req.body.maxDiscount,
        conditions: req.body.conditions,
        usageLimit: req.body.usageLimit,
        perUserLimit: req.body.perUserLimit,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      },
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Update coupon
couponRouter.put('/:id', async (req, res) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
        maxDiscount: req.body.maxDiscount,
        conditions: req.body.conditions,
        usageLimit: req.body.usageLimit,
        perUserLimit: req.body.perUserLimit,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isActive: req.body.isActive,
      },
    });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// Delete coupon
couponRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});
