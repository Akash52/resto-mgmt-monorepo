import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { useCreateOrder, useOrderPreview, useValidateCoupon } from '../hooks/useRestaurant';
import { Card, Button } from '@demo/ui';
import ErrorAlert from '../components/ErrorAlert';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    restaurantId,
    restaurantName,
    couponCode,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [billingPreview, setBillingPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCreateOrder();
  const orderPreview = useOrderPreview();
  const validateCoupon = useValidateCoupon();

  // Fetch billing preview when cart changes
  useEffect(() => {
    if (items.length > 0 && restaurantId) {
      orderPreview.mutate(
        {
          restaurantId,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
          couponCode: couponCode || undefined,
        },
        {
          onSuccess: (data) => setBillingPreview(data),
        }
      );
    }
  }, [items, restaurantId, couponCode]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !restaurantId) return;

    try {
      setError(null);
      const result = await validateCoupon.mutateAsync({
        restaurantId,
        code: couponInput.toUpperCase(),
      });

      if (result.valid) {
        applyCoupon(couponInput.toUpperCase());
        setCouponInput('');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) return;

    try {
      setError(null);
      const order = await createOrder.mutateAsync({
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        customerName,
        customerEmail,
        customerPhone,
        couponCode: couponCode || undefined,
      });

      clearCart();
      navigate(`/order/${order.orderNumber}`);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} className="mb-6" />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order from {restaurantName}</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">${item.basePrice.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold w-20 text-right">
                      ${(item.basePrice * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Coupon */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Apply Coupon</h3>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                <span className="text-green-700 font-medium">{couponCode} applied</span>
                <button onClick={removeCoupon} className="text-red-600 hover:text-red-800">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button onClick={handleApplyCoupon} disabled={validateCoupon.isPending}>
                  Apply
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary & Customer Info */}
        <div>
          {/* Billing Summary */}
          {billingPreview && (
            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${billingPreview.breakdown.subtotalAfterPricing.toFixed(2)}</span>
                </div>

                {billingPreview.breakdown.pricingAdjustments !== 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Pricing Adjustments</span>
                    <span>${billingPreview.breakdown.pricingAdjustments.toFixed(2)}</span>
                  </div>
                )}

                {billingPreview.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Item Discounts</span>
                    <span>-${billingPreview.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>${billingPreview.totalTax.toFixed(2)}</span>
                </div>

                {billingPreview.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-${billingPreview.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${billingPreview.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Customer Form */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Customer Information</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
