import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useRestaurant';
import { Card } from '@demo/ui';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order, isLoading } = useOrder(orderNumber!);

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return <div className="text-center py-12 text-red-600">Order not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Order #{order.orderNumber}</p>
      </div>

      <Card className="p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Restaurant:</span>
              <p className="font-medium">{order.restaurant.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium capitalize">{order.status.toLowerCase()}</p>
            </div>
            <div>
              <span className="text-gray-600">Customer:</span>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <span className="text-gray-600">Order Time:</span>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>

          {order.couponCode && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({order.couponCode})</span>
              <span>Discount applied</span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <div className="flex gap-4 justify-center">
          <Link
            to={`/track`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Track This Order
          </Link>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
}
