import {
  PricingRuleCondition,
  TaxRuleCondition,
  DiscountRuleCondition,
  CouponCondition,
  RuleEvaluationContext,
  CartItem,
} from './types';

export class RuleEvaluator {
  /**
   * Check if current time matches the time range
   */
  private static isTimeInRange(timeRange: string, currentTime: Date): boolean {
    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const current = currentTime.getHours() * 60 + currentTime.getMinutes();
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Handle overnight range
      return current >= start || current <= end;
    }
  }

  /**
   * Evaluate pricing rule conditions
   */
  static evaluatePricingRule(
    condition: PricingRuleCondition,
    context: RuleEvaluationContext,
    item: CartItem
  ): boolean {
    // Check day of week
    if (condition.dayOfWeek && condition.dayOfWeek.length > 0) {
      const currentDay = context.timestamp.getDay();
      if (!condition.dayOfWeek.includes(currentDay)) {
        return false;
      }
    }

    // Check time range
    if (condition.timeRange) {
      if (!this.isTimeInRange(condition.timeRange, context.timestamp)) {
        return false;
      }
    }

    // Check categories
    if (condition.categories && condition.categories.length > 0) {
      if (!condition.categories.includes(item.category)) {
        return false;
      }
    }

    // Check specific menu items
    if (condition.menuItems && condition.menuItems.length > 0) {
      if (!condition.menuItems.includes(item.menuItemId)) {
        return false;
      }
    }

    // Check quantity
    if (condition.minQuantity !== undefined && item.quantity < condition.minQuantity) {
      return false;
    }

    if (condition.maxQuantity !== undefined && item.quantity > condition.maxQuantity) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate tax rule conditions
   */
  static evaluateTaxRule(condition: TaxRuleCondition, item: CartItem, itemAmount: number): boolean {
    // Check categories
    if (condition.categories && condition.categories.length > 0) {
      if (!condition.categories.includes(item.category)) {
        return false;
      }
    }

    // Check tax categories
    if (condition.taxCategories && condition.taxCategories.length > 0) {
      if (!item.taxCategory || !condition.taxCategories.includes(item.taxCategory)) {
        return false;
      }
    }

    // Check specific menu items
    if (condition.menuItems && condition.menuItems.length > 0) {
      if (!condition.menuItems.includes(item.menuItemId)) {
        return false;
      }
    }

    // Check amount thresholds
    if (condition.minAmount !== undefined && itemAmount < condition.minAmount) {
      return false;
    }

    if (condition.maxAmount !== undefined && itemAmount > condition.maxAmount) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate discount rule conditions
   */
  static evaluateDiscountRule(
    condition: DiscountRuleCondition,
    context: RuleEvaluationContext,
    item?: CartItem
  ): boolean {
    // Check minimum order amount
    if (condition.minOrderAmount !== undefined && context.subtotal < condition.minOrderAmount) {
      return false;
    }

    // Check maximum order amount
    if (condition.maxOrderAmount !== undefined && context.subtotal > condition.maxOrderAmount) {
      return false;
    }

    // Check day of week
    if (condition.dayOfWeek && condition.dayOfWeek.length > 0) {
      const currentDay = context.timestamp.getDay();
      if (!condition.dayOfWeek.includes(currentDay)) {
        return false;
      }
    }

    // Check time range
    if (condition.timeRange) {
      if (!this.isTimeInRange(condition.timeRange, context.timestamp)) {
        return false;
      }
    }

    // Check first order only
    if (condition.firstOrderOnly && !context.isFirstOrder) {
      return false;
    }

    // Item-specific checks
    if (item) {
      // Check categories
      if (condition.categories && condition.categories.length > 0) {
        if (!condition.categories.includes(item.category)) {
          return false;
        }
      }

      // Check specific menu items
      if (condition.menuItems && condition.menuItems.length > 0) {
        if (!condition.menuItems.includes(item.menuItemId)) {
          return false;
        }
      }

      // Check quantity
      if (condition.minQuantity !== undefined && item.quantity < condition.minQuantity) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate coupon conditions
   */
  static evaluateCoupon(condition: CouponCondition, context: RuleEvaluationContext): boolean {
    // Check minimum order amount
    if (condition.minOrderAmount !== undefined && context.subtotal < condition.minOrderAmount) {
      return false;
    }

    // Check first order only
    if (condition.firstOrderOnly && !context.isFirstOrder) {
      return false;
    }

    // Check categories (at least one item must match)
    if (condition.categories && condition.categories.length > 0) {
      const hasMatchingCategory = context.cartItems.some((item) =>
        condition.categories!.includes(item.category)
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    // Check menu items (at least one item must match)
    if (condition.menuItems && condition.menuItems.length > 0) {
      const hasMatchingItem = context.cartItems.some((item) =>
        condition.menuItems!.includes(item.menuItemId)
      );
      if (!hasMatchingItem) {
        return false;
      }
    }

    return true;
  }
}
