import { useState } from 'react';
import { useOrder } from '../hooks/useRestaurant';
import { Card, Button } from '@demo/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { Link } from 'react-router-dom';

const STATUS_DISPLAY = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Order Received',
    description: 'We have received your order and are preparing it.',
  },
  CONFIRMED: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Confirmed',
    description: 'Your order has been confirmed by the restaurant.',
  },
  PREPARING: {
    color: 'bg-purple-100 text-purple-800',
    label: 'Preparing',
    description: 'Your food is being prepared with care.',
  },
  READY: {
    color: 'bg-green-100 text-green-800',
    label: 'Ready for Pickup',
    description: 'Your order is ready! Please come pick it up.',
  },
  DELIVERED: {
    color: 'bg-gray-100 text-gray-800',
    label: 'Completed',
    description: 'Order completed. Thank you for choosing us!',
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800',
    label: 'Cancelled',
    description: 'This order has been cancelled.',
  },
};

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrderNumber, setSearchedOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: order, isLoading, error: queryError } = useOrder(searchedOrderNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }
    setError(null);
    setSearchedOrderNumber(orderNumber.trim().toUpperCase());
  };

  const getStatusProgress = (currentStatus: string) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'CANCELLED') {
      return { percentage: 0, isCompleted: false };
    }

    return {
      percentage: currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0,
      isCompleted: currentStatus === 'DELIVERED',
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      {/* Search Form */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Enter Your Order Number</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Enter order number (e.g., ORD-123456)"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Track Order'}
          </Button>
        </form>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} className="mt-4" />}
      </Card>

      {/* Loading State */}
      {isLoading && <LoadingSpinner message="Looking up your order..." />}

      {/* Query Error */}
      {queryError && !isLoading && (
        <ErrorAlert
          message="Order not found. Please check your order number and try again."
          className="mb-6"
        />
      )}

      {/* Order Found */}
      {order && !isLoading && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-gray-600">
                  Restaurant: <span className="font-medium">{order.restaurant.name}</span>
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${STATUS_DISPLAY[order.status as keyof typeof STATUS_DISPLAY]?.color || 'bg-gray-100 text-gray-800'}`}
                >
                  {STATUS_DISPLAY[order.status as keyof typeof STATUS_DISPLAY]?.label ||
                    order.status}
                </div>
                <p className="text-lg font-bold text-green-600 mt-2">
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Status Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Order Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.round(getStatusProgress(order.status).percentage)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    order.status === 'CANCELLED'
                      ? 'bg-red-500'
                      : getStatusProgress(order.status).isCompleted
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${getStatusProgress(order.status).percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Status Description */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                {STATUS_DISPLAY[order.status as keyof typeof STATUS_DISPLAY]?.description ||
                  'Order status updated.'}
              </p>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>

            {/* Items */}
            <div className="space-y-3 mb-6">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h4 className="font-medium">{item.menuItem.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                    {item.discountAmount > 0 && (
                      <p className="text-sm text-green-600">
                        Discount: -${item.discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount{order.couponCode && ` (${order.couponCode})`}:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Info */}
            {order.customerName && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Name:</span> {order.customerName}
                  </p>
                  {order.customerPhone && (
                    <p>
                      <span className="font-medium">Phone:</span> {order.customerPhone}
                    </p>
                  )}
                  {order.customerEmail && (
                    <p>
                      <span className="font-medium">Email:</span> {order.customerEmail}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Contact Restaurant */}
          <Card className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, please contact the restaurant directly:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${order.restaurant.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Restaurant
              </a>
              <p className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {order.restaurant.phone}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Restaurants
        </Link>
      </div>
    </div>
  );
}
