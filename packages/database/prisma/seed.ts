import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.billingConfig.deleteMany();
  await prisma.restaurant.deleteMany();

  // Create Restaurant 1: Pizza Palace
  console.log('Creating Pizza Palace...');
  const pizzaPalace = await prisma.restaurant.create({
    data: {
      name: 'Pizza Palace',
      slug: 'pizza-palace',
      description: 'Authentic Italian pizza with a modern twist',
      address: '123 Main Street, Downtown',
      phone: '(555) 123-4567',
      email: 'info@pizzapalace.com',
      isActive: true,
      billingConfig: {
        create: {
          defaultTaxRate: 8,
          taxInclusive: false,
          pricingStrategy: 'DYNAMIC',
          allowCoupons: true,
          allowItemDiscounts: true,
          maxDiscountPercent: 50,
        },
      },
    },
  });

  // Add menu items for Pizza Palace
  console.log('Adding Pizza Palace menu...');
  const pizzas = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, fresh mozzarella, and basil',
        basePrice: 12.99,
        category: 'pizza',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with premium pepperoni and cheese',
        basePrice: 14.99,
        category: 'pizza',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Veggie Supreme',
        description: 'Bell peppers, onions, mushrooms, olives, and tomatoes',
        basePrice: 13.99,
        category: 'pizza',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Caesar Salad',
        description: 'Crisp romaine, parmesan, croutons, Caesar dressing',
        basePrice: 8.99,
        category: 'salad',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Garlic Breadsticks',
        description: 'Fresh baked with garlic butter and parmesan',
        basePrice: 5.99,
        category: 'appetizer',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Craft Beer',
        description: 'Selection of local craft beers',
        basePrice: 6.99,
        category: 'beverage',
        taxCategory: 'alcohol',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: pizzaPalace.id,
        name: 'Soft Drink',
        description: 'Coke, Sprite, or Fanta',
        basePrice: 2.99,
        category: 'beverage',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
  ]);

  // Add pricing rules for Pizza Palace
  console.log('Creating pricing rules...');
  await prisma.pricingRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Happy Hour - Beverages',
      description: '25% off all beverages from 4-7 PM on weekdays',
      type: 'HAPPY_HOUR',
      priority: 10,
      isActive: true,
      conditions: {
        dayOfWeek: [1, 2, 3, 4, 5],
        timeRange: '16:00-19:00',
        categories: ['beverage'],
      },
      action: {
        type: 'PERCENTAGE',
        value: -25,
      },
    },
  });

  await prisma.pricingRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Weekend Premium',
      description: 'Small markup on weekend evenings',
      type: 'MARKUP',
      priority: 5,
      isActive: true,
      conditions: {
        dayOfWeek: [5, 6],
        timeRange: '18:00-22:00',
      },
      action: {
        type: 'PERCENTAGE',
        value: 10,
      },
    },
  });

  // Add tax rules
  console.log('Creating tax rules...');
  await prisma.taxRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Standard Food Tax',
      description: 'Standard 8% tax on food items',
      rate: 8,
      applicationType: 'PERCENTAGE',
      priority: 5,
      isActive: true,
      isCompound: false,
      conditions: {
        taxCategories: ['food'],
      },
    },
  });

  await prisma.taxRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Alcohol Tax',
      description: 'Additional 10% tax on alcoholic beverages',
      rate: 10,
      applicationType: 'PERCENTAGE',
      priority: 5,
      isActive: true,
      isCompound: false,
      conditions: {
        taxCategories: ['alcohol'],
      },
    },
  });

  // Add discount rules
  console.log('Creating discount rules...');
  await prisma.discountRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Large Order Discount',
      description: '15% off orders over $50',
      type: 'PERCENTAGE',
      value: 15,
      maxDiscount: 20,
      priority: 8,
      isActive: true,
      conditions: {
        minOrderAmount: 50,
      },
    },
  });

  await prisma.discountRule.create({
    data: {
      restaurantId: pizzaPalace.id,
      name: 'Pizza Deal',
      description: '10% off when ordering 3 or more pizzas',
      type: 'PERCENTAGE',
      value: 10,
      priority: 7,
      isActive: true,
      conditions: {
        categories: ['pizza'],
        minQuantity: 3,
      },
    },
  });

  // Add coupons
  console.log('Creating coupons...');
  await prisma.coupon.create({
    data: {
      restaurantId: pizzaPalace.id,
      code: 'WELCOME20',
      description: '20% off your first order',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscount: 15,
      isActive: true,
      conditions: {
        minOrderAmount: 25,
      },
      usageLimit: 100,
      perUserLimit: 1,
    },
  });

  await prisma.coupon.create({
    data: {
      restaurantId: pizzaPalace.id,
      code: 'PIZZA10',
      description: '$10 off pizza orders over $30',
      discountType: 'FIXED_AMOUNT',
      discountValue: 10,
      isActive: true,
      conditions: {
        minOrderAmount: 30,
        categories: ['pizza'],
      },
      usageLimit: 50,
    },
  });

  // Create Restaurant 2: Burger Hub
  console.log('\nCreating Burger Hub...');
  const burgerHub = await prisma.restaurant.create({
    data: {
      name: 'Burger Hub',
      slug: 'burger-hub',
      description: 'Gourmet burgers and craft shakes',
      address: '456 Oak Avenue, Food District',
      phone: '(555) 987-6543',
      email: 'hello@burgerhub.com',
      isActive: true,
      billingConfig: {
        create: {
          defaultTaxRate: 7.5,
          taxInclusive: false,
          pricingStrategy: 'STANDARD',
          allowCoupons: true,
          allowItemDiscounts: true,
          maxDiscountPercent: 40,
        },
      },
    },
  });

  // Add menu items for Burger Hub
  console.log('Adding Burger Hub menu...');
  await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'Classic Cheeseburger',
        description: 'Angus beef, cheddar, lettuce, tomato, special sauce',
        basePrice: 10.99,
        category: 'burger',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'BBQ Bacon Burger',
        description: 'Beef patty, crispy bacon, BBQ sauce, onion rings',
        basePrice: 12.99,
        category: 'burger',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'Veggie Burger',
        description: 'Plant-based patty, avocado, sprouts',
        basePrice: 11.99,
        category: 'burger',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        basePrice: 4.99,
        category: 'sides',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'Onion Rings',
        description: 'Beer-battered crispy onion rings',
        basePrice: 5.99,
        category: 'sides',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: burgerHub.id,
        name: 'Chocolate Shake',
        description: 'Thick and creamy chocolate milkshake',
        basePrice: 5.99,
        category: 'beverage',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
  ]);

  // Add rules for Burger Hub
  await prisma.taxRule.create({
    data: {
      restaurantId: burgerHub.id,
      name: 'Standard Tax',
      description: 'Standard 7.5% tax',
      rate: 7.5,
      applicationType: 'PERCENTAGE',
      priority: 5,
      isActive: true,
      isCompound: false,
      conditions: {},
    },
  });

  await prisma.discountRule.create({
    data: {
      restaurantId: burgerHub.id,
      name: 'Combo Deal',
      description: '20% off when ordering burger + sides',
      type: 'PERCENTAGE',
      value: 20,
      priority: 9,
      isActive: true,
      conditions: {
        minOrderAmount: 15,
      },
    },
  });

  await prisma.coupon.create({
    data: {
      restaurantId: burgerHub.id,
      code: 'BURGER15',
      description: '15% off any order',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscount: 10,
      isActive: true,
      conditions: {
        minOrderAmount: 20,
      },
      usageLimit: 200,
    },
  });

  // Create Restaurant 3: Sushi Master
  console.log('\nCreating Sushi Master...');
  const sushiMaster = await prisma.restaurant.create({
    data: {
      name: 'Sushi Master',
      slug: 'sushi-master',
      description: 'Fresh sushi and Japanese cuisine',
      address: '789 Pearl Street, Harbor View',
      phone: '(555) 246-8135',
      email: 'contact@sushimaster.com',
      isActive: true,
      billingConfig: {
        create: {
          defaultTaxRate: 9,
          taxInclusive: false,
          pricingStrategy: 'TIME_BASED',
          allowCoupons: true,
          allowItemDiscounts: true,
        },
      },
    },
  });

  // Add menu items for Sushi Master
  console.log('Adding Sushi Master menu...');
  await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'California Roll',
        description: 'Crab, avocado, cucumber',
        basePrice: 8.99,
        category: 'sushi',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Spicy Tuna Roll',
        description: 'Fresh tuna with spicy mayo',
        basePrice: 10.99,
        category: 'sushi',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Dragon Roll',
        description: 'Eel, avocado, cucumber with special sauce',
        basePrice: 14.99,
        category: 'sushi',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup',
        basePrice: 3.99,
        category: 'appetizer',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Edamame',
        description: 'Steamed soybeans with sea salt',
        basePrice: 4.99,
        category: 'appetizer',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Sake',
        description: 'Premium Japanese rice wine',
        basePrice: 8.99,
        category: 'beverage',
        taxCategory: 'alcohol',
        isAvailable: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: sushiMaster.id,
        name: 'Green Tea',
        description: 'Hot or iced Japanese green tea',
        basePrice: 2.99,
        category: 'beverage',
        taxCategory: 'food',
        isAvailable: true,
      },
    }),
  ]);

  // Add rules for Sushi Master
  await prisma.pricingRule.create({
    data: {
      restaurantId: sushiMaster.id,
      name: 'Lunch Special',
      description: '20% off during lunch hours',
      type: 'MARKDOWN',
      priority: 10,
      isActive: true,
      conditions: {
        dayOfWeek: [1, 2, 3, 4, 5],
        timeRange: '11:00-14:00',
      },
      action: {
        type: 'PERCENTAGE',
        value: -20,
      },
    },
  });

  await prisma.taxRule.create({
    data: {
      restaurantId: sushiMaster.id,
      name: 'Food Tax',
      description: '9% tax on food',
      rate: 9,
      applicationType: 'PERCENTAGE',
      priority: 5,
      isActive: true,
      isCompound: false,
      conditions: {
        taxCategories: ['food'],
      },
    },
  });

  await prisma.taxRule.create({
    data: {
      restaurantId: sushiMaster.id,
      name: 'Alcohol Tax',
      description: '12% tax on alcohol',
      rate: 12,
      applicationType: 'PERCENTAGE',
      priority: 5,
      isActive: true,
      isCompound: false,
      conditions: {
        taxCategories: ['alcohol'],
      },
    },
  });

  await prisma.coupon.create({
    data: {
      restaurantId: sushiMaster.id,
      code: 'SUSHI25',
      description: '$25 off orders over $100',
      discountType: 'FIXED_AMOUNT',
      discountValue: 25,
      isActive: true,
      conditions: {
        minOrderAmount: 100,
      },
      usageLimit: 30,
    },
  });

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 3 Restaurants created');
  console.log('  - 20+ Menu items added');
  console.log('  - Multiple pricing rules (happy hours, lunch specials, weekend pricing)');
  console.log('  - Tax rules (food tax, alcohol tax)');
  console.log('  - Discount rules (bulk orders, combos)');
  console.log('  - 5 Active coupons');
  console.log('\n🎉 Ready to test the system!');
  console.log('\nCoupon Codes to try:');
  console.log('  - WELCOME20 (Pizza Palace)');
  console.log('  - PIZZA10 (Pizza Palace)');
  console.log('  - BURGER15 (Burger Hub)');
  console.log('  - SUSHI25 (Sushi Master)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
