import { Router } from 'express';
import { prisma } from '@demo/database';

export const billingConfigRouter = Router();

// Get billing config for a restaurant
billingConfigRouter.get('/:restaurantId', async (req, res) => {
  try {
    const config = await prisma.billingConfig.findUnique({
      where: { restaurantId: req.params.restaurantId },
    });

    if (!config) {
      return res.status(404).json({ error: 'Billing config not found' });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing config' });
  }
});

// Update billing config
billingConfigRouter.put('/:restaurantId', async (req, res) => {
  try {
    const config = await prisma.billingConfig.upsert({
      where: { restaurantId: req.params.restaurantId },
      update: {
        defaultTaxRate: req.body.defaultTaxRate,
        taxInclusive: req.body.taxInclusive,
        pricingStrategy: req.body.pricingStrategy,
        allowCoupons: req.body.allowCoupons,
        allowItemDiscounts: req.body.allowItemDiscounts,
        maxDiscountPercent: req.body.maxDiscountPercent,
      },
      create: {
        restaurantId: req.params.restaurantId,
        defaultTaxRate: req.body.defaultTaxRate,
        taxInclusive: req.body.taxInclusive,
        pricingStrategy: req.body.pricingStrategy,
        allowCoupons: req.body.allowCoupons,
        allowItemDiscounts: req.body.allowItemDiscounts,
        maxDiscountPercent: req.body.maxDiscountPercent,
      },
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update billing config' });
  }
});
