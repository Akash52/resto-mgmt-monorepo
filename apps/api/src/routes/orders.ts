import { Router } from 'express';
import { prisma } from '@demo/database';
import { BillingEngine, CartItem } from '@demo/billing-engine';

export const orderRouter = Router();

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Create order with billing calculation
orderRouter.post('/', async (req, res) => {
  try {
    const { restaurantId, items, customerName, customerEmail, customerPhone, couponCode } =
      req.body;

    // Fetch menu items
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ error: 'Some items are not available' });
    }

    // Prepare cart items
    const cartItems: CartItem[] = items.map((item: any) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        basePrice: menuItem.basePrice,
        quantity: item.quantity,
        category: menuItem.category,
        taxCategory: menuItem.taxCategory || undefined,
      };
    });

    // Fetch billing rules
    const [pricingRules, taxRules, discountRules, coupons] = await Promise.all([
      prisma.pricingRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.taxRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.discountRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.coupon.findMany({ where: { restaurantId, isActive: true } }),
    ]);

    // Calculate billing
    const billingEngine = new BillingEngine(pricingRules, taxRules, discountRules, coupons);
    const billing = await billingEngine.calculateBilling(cartItems, couponCode);

    // Create order
    const order = await prisma.order.create({
      data: {
        restaurantId,
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail,
        customerPhone,
        status: 'PENDING',
        subtotal: billing.subtotal,
        taxAmount: billing.totalTax,
        discountAmount: billing.totalDiscount,
        totalAmount: billing.grandTotal,
        appliedPricingRules: billing.appliedPricingRules,
        appliedTaxRules: billing.appliedTaxRules,
        appliedDiscounts: billing.appliedDiscounts,
        couponCode: billing.couponCode,
        billingDetails: billing as any,
        items: {
          create: billing.lineItems.map((lineItem) => ({
            menuItemId: lineItem.menuItemId,
            quantity: lineItem.quantity,
            unitPrice: lineItem.unitPrice,
            totalPrice: lineItem.totalPrice,
            taxAmount: lineItem.taxAmount,
            discountAmount: lineItem.discountAmount,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Update coupon usage if applied
    if (billing.couponCode && couponCode) {
      await prisma.coupon.update({
        where: {
          restaurantId_code: {
            restaurantId,
            code: couponCode,
          },
        },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get orders for a restaurant
orderRouter.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: req.params.restaurantId,
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by ID (for dashboard)
orderRouter.get('/id/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get single order by order number (for customers)
orderRouter.get('/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
orderRouter.patch('/:id/status', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Calculate billing preview (without creating order)
orderRouter.post('/preview', async (req, res) => {
  try {
    const { restaurantId, items, couponCode } = req.body;

    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
        isAvailable: true,
      },
    });

    const cartItems: CartItem[] = items.map((item: any) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        basePrice: menuItem.basePrice,
        quantity: item.quantity,
        category: menuItem.category,
        taxCategory: menuItem.taxCategory || undefined,
      };
    });

    const [pricingRules, taxRules, discountRules, coupons] = await Promise.all([
      prisma.pricingRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.taxRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.discountRule.findMany({ where: { restaurantId, isActive: true } }),
      prisma.coupon.findMany({ where: { restaurantId, isActive: true } }),
    ]);

    const billingEngine = new BillingEngine(pricingRules, taxRules, discountRules, coupons);
    const billing = await billingEngine.calculateBilling(cartItems, couponCode);

    res.json(billing);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate billing', details: error.message });
  }
});
