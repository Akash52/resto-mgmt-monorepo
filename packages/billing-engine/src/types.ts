// Core types for billing calculations

export interface CartItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  category: string;
  taxCategory?: string;
}

export interface PricingRuleCondition {
  dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  timeRange?: string; // "HH:MM-HH:MM"
  categories?: string[];
  menuItems?: string[];
  minQuantity?: number;
  maxQuantity?: number;
}

export interface PricingRuleAction {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIXED_PRICE';
  value: number;
}

export interface TaxRuleCondition {
  categories?: string[];
  taxCategories?: string[];
  menuItems?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface DiscountRuleCondition {
  minOrderAmount?: number;
  maxOrderAmount?: number;
  categories?: string[];
  menuItems?: string[];
  minQuantity?: number;
  dayOfWeek?: number[];
  timeRange?: string;
  firstOrderOnly?: boolean;
}

export interface CouponCondition {
  minOrderAmount?: number;
  categories?: string[];
  menuItems?: string[];
  firstOrderOnly?: boolean;
  maxUses?: number;
}

export interface BillingLineItem {
  menuItemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  unitPrice: number; // After pricing rules
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
  appliedPricingRules: string[];
  appliedTaxRules: string[];
  appliedDiscounts: string[];
}

export interface BillingCalculation {
  lineItems: BillingLineItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  couponDiscount: number;
  grandTotal: number;
  appliedPricingRules: string[];
  appliedTaxRules: string[];
  appliedDiscounts: string[];
  couponCode?: string;
  breakdown: {
    itemSubtotal: number;
    pricingAdjustments: number;
    subtotalAfterPricing: number;
    itemDiscounts: number;
    subtotalAfterDiscounts: number;
    taxes: number;
    couponDiscount: number;
    finalTotal: number;
  };
}

export interface RuleEvaluationContext {
  cartItems: CartItem[];
  timestamp: Date;
  subtotal: number;
  customerEmail?: string;
  isFirstOrder?: boolean;
}
