import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import { useRestaurant, useUpdateRestaurant } from '../hooks/useRestaurants';

export function SettingsPage() {
  const { selectedRestaurantSlug } = useRestaurantContext();
  const { data: restaurant, isLoading, error } = useRestaurant(selectedRestaurantSlug);
  const updateMutation = useUpdateRestaurant();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  if (!selectedRestaurantSlug) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Please select a restaurant first</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p>Loading restaurant settings...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Error loading restaurant: {error.message}</p>
      </Card>
    );
  }

  if (!restaurant) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Restaurant not found</p>
      </Card>
    );
  }

  const handleEditStart = () => {
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: restaurant.id,
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Settings</h2>
        {isEditing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Editing Mode
          </div>
        )}
      </div>

      <Card className="p-6 bg-green-50">
        <h3 className="font-semibold mb-2">✅ Restaurant Information Editor</h3>
        <p className="text-sm text-gray-700 mb-2">
          You can now edit your restaurant's basic information including name, description, contact
          details, and address.
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Editable Fields:</strong>
          </p>
          <ul className="ml-4 space-y-1">
            <li>
              • <strong>Restaurant Name:</strong> Your restaurant's display name
            </li>
            <li>
              • <strong>Description:</strong> Brief description of your restaurant
            </li>
            <li>
              • <strong>Phone & Email:</strong> Primary contact information
            </li>
            <li>
              • <strong>Address:</strong> Complete physical address
            </li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> Active status changes require admin approval
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">✅ Basic Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
              <input
                type="text"
                required
                value={isEditing ? formData.name : restaurant.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
                placeholder="Enter restaurant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuisine Type</label>
              <input
                type="text"
                value="Not specified in current schema"
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Feature will be added in future update</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={
                isEditing
                  ? formData.description
                  : restaurant.description || 'No description provided'
              }
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md ${
                !isEditing ? 'bg-gray-50' : 'bg-white'
              }`}
              rows={3}
              placeholder="Enter restaurant description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={isEditing ? formData.phone : restaurant.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={isEditing ? formData.email : restaurant.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <input
              type="text"
              required
              value={isEditing ? formData.address : restaurant.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md ${
                !isEditing ? 'bg-gray-50' : 'bg-white'
              }`}
              placeholder="Enter full address"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={restaurant.isActive} disabled className="w-4 h-4" />
            <label className="text-sm font-medium">Restaurant is Active</label>
            <span className="text-xs text-gray-500 ml-2">
              (Contact admin to change active status)
            </span>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t">
          {!isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleEditStart}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Settings
              </button>
              <div>
                <p className="text-sm text-green-600 mt-2">
                  ✅ Edit functionality is now available!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleEditCancel}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
          {updateMutation.error && (
            <p className="text-sm text-red-600 mt-2">
              Error updating restaurant: {updateMutation.error.message}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">✅ Billing Configuration Overview</h3>
        {restaurant.billingConfig ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Tax Rate</label>
                <input
                  type="text"
                  value={`${restaurant.billingConfig.defaultTaxRate}%`}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Inclusive</label>
                <input
                  type="text"
                  value={restaurant.billingConfig.taxInclusive ? 'Yes' : 'No'}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pricing Strategy</label>
                <input
                  type="text"
                  value={restaurant.billingConfig.pricingStrategy}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount %</label>
                <input
                  type="text"
                  value={
                    restaurant.billingConfig.maxDiscountPercent
                      ? `${restaurant.billingConfig.maxDiscountPercent}%`
                      : 'Unlimited'
                  }
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restaurant.billingConfig.allowCoupons}
                  disabled
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Allow Coupons</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restaurant.billingConfig.allowItemDiscounts}
                  disabled
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Allow Item Discounts</label>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">
            No billing configuration found. Contact system administrator.
          </p>
        )}

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            View and manage detailed billing configurations from their respective pages:
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">📝</div>
              <div className="text-sm font-medium">Pricing Rules</div>
              <div className="text-xs text-gray-600">Configure dynamic pricing</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">🧾</div>
              <div className="text-sm font-medium">Tax Rules</div>
              <div className="text-xs text-gray-600">Manage tax configurations</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">🎁</div>
              <div className="text-sm font-medium">Discount Rules</div>
              <div className="text-xs text-gray-600">Handle discount rules</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2">✅ System Information</h3>
        <div className="text-sm space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Restaurant ID:</span>
              <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                {restaurant.id}
              </div>
            </div>
            <div>
              <span className="font-medium">Restaurant Slug:</span>
              <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                {restaurant.slug}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="font-medium">Created:</span>
              <div className="text-xs text-gray-700 mt-1">
                {new Date(restaurant.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <div className="text-xs text-gray-700 mt-1">
                {new Date(restaurant.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          {restaurant.billingConfig && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="font-medium text-sm mb-2">Billing Config ID:</div>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                {restaurant.billingConfig.id}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
