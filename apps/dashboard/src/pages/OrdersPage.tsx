import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import { useOrders, useUpdateOrderStatus, type Order } from '../hooks/useOrders';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS: Order['status'][] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
];

export function OrdersPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: orders, isLoading, refetch } = useOrders(selectedRestaurantId);
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'ALL'>('ALL');

  // Debug logging
  console.log('🍽️ OrdersPage Debug:', {
    selectedRestaurantId,
    ordersCount: orders?.length || 0,
    orders: orders?.slice(0, 2), // Log first 2 orders
    isLoading,
  });

  if (!selectedRestaurantId) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Please select a restaurant first</p>
      </Card>
    );
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    await updateStatusMutation.mutateAsync({
      id: orderId,
      status: newStatus,
      restaurantId: selectedRestaurantId,
    });
  };

  const filteredOrders =
    orders?.filter((order) => filterStatus === 'ALL' || order.status === filterStatus) || [];

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'PENDING').length || 0,
    preparing: orders?.filter((o) => o.status === 'PREPARING').length || 0,
    ready: orders?.filter((o) => o.status === 'READY').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex gap-3">
          <div className="text-sm text-gray-600">
            Restaurant ID: <code className="bg-gray-100 px-1 rounded">{selectedRestaurantId}</code>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
          <div className="text-sm text-gray-600">Preparing</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          <div className="text-sm text-gray-600">Ready</div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-2 rounded-md ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <Card className="p-6">
          <p>Loading orders...</p>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No orders found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {order.customerName && (
                    <div className="text-sm text-gray-600 mb-3">
                      Customer: {order.customerName}{' '}
                      {order.customerPhone && `• ${order.customerPhone}`}
                    </div>
                  )}

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                        </span>
                        <span>${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-1">
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
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <label className="block text-sm font-medium mb-2">Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order.id, e.target.value as Order['status'])
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="mt-2 w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl">
                &times;
              </button>
            </div>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(selectedOrder, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
