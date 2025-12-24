import { PricingRule, TaxRule, DiscountRule, Coupon } from '@demo/database';
import { RuleEvaluator } from './rule-evaluator';
import {
  CartItem,
  BillingCalculation,
  BillingLineItem,
  RuleEvaluationContext,
  PricingRuleCondition,
  PricingRuleAction,
  TaxRuleCondition,
  DiscountRuleCondition,
  CouponCondition,
} from './types';

export class BillingEngine {
  private pricingRules: PricingRule[];
  private taxRules: TaxRule[];
  private discountRules: DiscountRule[];
  private coupons: Coupon[];

  constructor(
    pricingRules: PricingRule[],
    taxRules: TaxRule[],
    discountRules: DiscountRule[],
    coupons: Coupon[]
  ) {
    // Sort by priority (higher first)
    this.pricingRules = pricingRules
      .filter((r) => r.isActive)
      .sort((a, b) => b.priority - a.priority);

    this.taxRules = taxRules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);

    this.discountRules = discountRules
      .filter((r) => r.isActive)
      .sort((a, b) => b.priority - a.priority);

    this.coupons = coupons.filter((c) => c.isActive);
  }

  /**
   * Calculate billing for a cart
   */
  async calculateBilling(
    cartItems: CartItem[],
    couponCode?: string,
    context?: Partial<RuleEvaluationContext>
  ): Promise<BillingCalculation> {
    const timestamp = context?.timestamp || new Date();
    const isFirstOrder = context?.isFirstOrder || false;
    const customerEmail = context?.customerEmail;

    // Step 1: Apply pricing rules to get adjusted prices
    const lineItems: BillingLineItem[] = [];
    let itemSubtotal = 0;

    for (const item of cartItems) {
      const lineItem = this.calculateLineItem(item, timestamp);
      lineItems.push(lineItem);
      itemSubtotal += lineItem.basePrice * lineItem.quantity;
    }

    // Calculate subtotal after pricing adjustments
    const subtotalAfterPricing = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const pricingAdjustments = subtotalAfterPricing - itemSubtotal;

    // Create evaluation context
    const evaluationContext: RuleEvaluationContext = {
      cartItems,
      timestamp,
      subtotal: subtotalAfterPricing,
      customerEmail,
      isFirstOrder,
    };

    // Step 2: Apply item-level discounts
    for (const lineItem of lineItems) {
      const item = cartItems.find((i) => i.menuItemId === lineItem.menuItemId)!;
      const itemDiscount = this.calculateItemDiscount(lineItem, item, evaluationContext);
      lineItem.discountAmount = itemDiscount.amount;
      lineItem.appliedDiscounts = itemDiscount.ruleIds;
    }

    const itemDiscounts = lineItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const subtotalAfterDiscounts = subtotalAfterPricing - itemDiscounts;

    // Step 3: Apply taxes
    for (const lineItem of lineItems) {
      const item = cartItems.find((i) => i.menuItemId === lineItem.menuItemId)!;
      const itemAmount = lineItem.subtotal - lineItem.discountAmount;
      const tax = this.calculateTax(item, itemAmount);
      lineItem.taxAmount = tax.amount;
      lineItem.appliedTaxRules = tax.ruleIds;
    }

    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);

    // Step 4: Apply coupon discount
    let couponDiscount = 0;
    let appliedCoupon: Coupon | undefined;

    if (couponCode) {
      const result = this.applyCoupon(couponCode, subtotalAfterDiscounts, evaluationContext);
      couponDiscount = result.discount;
      appliedCoupon = result.coupon;
    }

    // Step 5: Calculate final totals
    const finalTotal = subtotalAfterDiscounts + totalTax - couponDiscount;

    // Update line item totals
    for (const lineItem of lineItems) {
      lineItem.totalPrice = lineItem.subtotal - lineItem.discountAmount + lineItem.taxAmount;
    }

    // Collect all applied rules
    const appliedPricingRules = [...new Set(lineItems.flatMap((i) => i.appliedPricingRules))];
    const appliedTaxRules = [...new Set(lineItems.flatMap((i) => i.appliedTaxRules))];
    const appliedDiscounts = [...new Set(lineItems.flatMap((i) => i.appliedDiscounts))];

    return {
      lineItems,
      subtotal: subtotalAfterPricing,
      totalTax,
      totalDiscount: itemDiscounts,
      couponDiscount,
      grandTotal: finalTotal,
      appliedPricingRules,
      appliedTaxRules,
      appliedDiscounts,
      couponCode: appliedCoupon?.code,
      breakdown: {
        itemSubtotal,
        pricingAdjustments,
        subtotalAfterPricing,
        itemDiscounts,
        subtotalAfterDiscounts,
        taxes: totalTax,
        couponDiscount,
        finalTotal,
      },
    };
  }

  /**
   * Calculate line item with pricing rules
   */
  private calculateLineItem(item: CartItem, timestamp: Date): BillingLineItem {
    let unitPrice = item.basePrice;
    const appliedRules: string[] = [];

    const context: RuleEvaluationContext = {
      cartItems: [item],
      timestamp,
      subtotal: item.basePrice * item.quantity,
    };

    // Apply pricing rules
    for (const rule of this.pricingRules) {
      const condition = rule.conditions as unknown as PricingRuleCondition;
      const action = rule.action as unknown as PricingRuleAction;

      if (RuleEvaluator.evaluatePricingRule(condition, context, item)) {
        unitPrice = this.applyPricingAction(unitPrice, action);
        appliedRules.push(rule.id);

        // Only apply first matching rule (highest priority)
        break;
      }
    }

    return {
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      basePrice: item.basePrice,
      unitPrice,
      subtotal: unitPrice * item.quantity,
      taxAmount: 0,
      discountAmount: 0,
      totalPrice: 0,
      appliedPricingRules: appliedRules,
      appliedTaxRules: [],
      appliedDiscounts: [],
    };
  }

  /**
   * Apply pricing action to a price
   */
  private applyPricingAction(price: number, action: PricingRuleAction): number {
    switch (action.type) {
      case 'PERCENTAGE':
        return price * (1 + action.value / 100);
      case 'FIXED_AMOUNT':
        return price + action.value;
      case 'FIXED_PRICE':
        return action.value;
      default:
        return price;
    }
  }

  /**
   * Calculate item-level discount
   */
  private calculateItemDiscount(
    lineItem: BillingLineItem,
    item: CartItem,
    context: RuleEvaluationContext
  ): { amount: number; ruleIds: string[] } {
    let discountAmount = 0;
    const appliedRules: string[] = [];

    for (const rule of this.discountRules) {
      const condition = rule.conditions as unknown as DiscountRuleCondition;

      if (RuleEvaluator.evaluateDiscountRule(condition, context, item)) {
        const discount = this.calculateDiscountAmount(
          lineItem.subtotal,
          rule.type,
          rule.value,
          rule.maxDiscount
        );

        discountAmount += discount;
        appliedRules.push(rule.id);
      }
    }

    return { amount: Math.min(discountAmount, lineItem.subtotal), ruleIds: appliedRules };
  }

  /**
   * Calculate tax for an item
   */
  private calculateTax(item: CartItem, itemAmount: number): { amount: number; ruleIds: string[] } {
    let taxAmount = 0;
    const appliedRules: string[] = [];
    let baseAmount = itemAmount;

    // First apply non-compound taxes
    for (const rule of this.taxRules.filter((r) => !r.isCompound)) {
      const condition = rule.conditions as unknown as TaxRuleCondition;

      if (RuleEvaluator.evaluateTaxRule(condition, item, itemAmount)) {
        const tax = this.calculateTaxAmount(baseAmount, rule.applicationType, rule.rate);
        taxAmount += tax;
        appliedRules.push(rule.id);
      }
    }

    // Then apply compound taxes (on subtotal + previous taxes)
    const compoundBase = itemAmount + taxAmount;
    for (const rule of this.taxRules.filter((r) => r.isCompound)) {
      const condition = rule.conditions as unknown as TaxRuleCondition;

      if (RuleEvaluator.evaluateTaxRule(condition, item, itemAmount)) {
        const tax = this.calculateTaxAmount(compoundBase, rule.applicationType, rule.rate);
        taxAmount += tax;
        appliedRules.push(rule.id);
      }
    }

    return { amount: taxAmount, ruleIds: appliedRules };
  }

  /**
   * Calculate tax amount based on application type
   */
  private calculateTaxAmount(amount: number, applicationType: string, rate: number): number {
    switch (applicationType) {
      case 'PERCENTAGE':
        return amount * (rate / 100);
      case 'FIXED_AMOUNT':
        return rate;
      default:
        return amount * (rate / 100);
    }
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscountAmount(
    amount: number,
    type: string,
    value: number,
    maxDiscount?: number | null
  ): number {
    let discount = 0;

    switch (type) {
      case 'PERCENTAGE':
        discount = amount * (value / 100);
        if (maxDiscount !== null && maxDiscount !== undefined) {
          discount = Math.min(discount, maxDiscount);
        }
        break;
      case 'FIXED_AMOUNT':
        discount = value;
        break;
      default:
        discount = 0;
    }

    return Math.min(discount, amount);
  }

  /**
   * Apply coupon discount
   */
  private applyCoupon(
    code: string,
    subtotal: number,
    context: RuleEvaluationContext
  ): { discount: number; coupon?: Coupon } {
    const coupon = this.coupons.find((c) => c.code === code);

    if (!coupon) {
      return { discount: 0 };
    }

    // Check date validity
    const now = context.timestamp;
    if (coupon.startDate && now < coupon.startDate) {
      return { discount: 0 };
    }
    if (coupon.endDate && now > coupon.endDate) {
      return { discount: 0 };
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { discount: 0 };
    }

    // Evaluate conditions
    const condition = coupon.conditions as unknown as CouponCondition;
    if (!RuleEvaluator.evaluateCoupon(condition, context)) {
      return { discount: 0 };
    }

    // Calculate discount
    const discount = this.calculateDiscountAmount(
      subtotal,
      coupon.discountType,
      coupon.discountValue,
      coupon.maxDiscount
    );

    return { discount, coupon };
  }
}
