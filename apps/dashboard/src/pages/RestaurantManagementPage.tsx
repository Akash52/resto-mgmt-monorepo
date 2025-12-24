import { useState } from 'react';
import { Card } from '@demo/ui';
import { LoadingSpinner, ErrorAlert } from '../components/UIComponents';
import {
  useRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  useDeleteRestaurant,
  type Restaurant,
} from '../hooks/useRestaurants';

export function RestaurantManagementPage() {
  const { data: restaurants, isLoading, error } = useRestaurants();
  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();
  const deleteMutation = useDeleteRestaurant();

  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
    defaultTaxRate: '8.25',
    taxInclusive: false,
    pricingStrategy: 'STANDARD',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      defaultTaxRate: parseFloat(formData.defaultTaxRate),
    };

    try {
      if (editingRestaurant) {
        await updateMutation.mutateAsync({ id: editingRestaurant.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save restaurant:', error);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      isActive: restaurant.isActive,
      defaultTaxRate: restaurant.billingConfig?.defaultTaxRate?.toString() || '8.25',
      taxInclusive: restaurant.billingConfig?.taxInclusive || false,
      pricingStrategy: restaurant.billingConfig?.pricingStrategy || 'STANDARD',
    });
    setShowForm(true);
  };

  const handleDelete = async (restaurant: Restaurant) => {
    if (confirm(`Delete restaurant "${restaurant.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(restaurant.id);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRestaurant(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      isActive: true,
      defaultTaxRate: '8.25',
      taxInclusive: false,
      pricingStrategy: 'STANDARD',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingRestaurant ? prev.slug : generateSlug(name),
    }));
  };

  if (isLoading) return <LoadingSpinner message="Loading restaurants..." />;
  if (error) return <ErrorAlert message="Failed to load restaurants" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Restaurant'}
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Mario's Pizza Palace"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., marios-pizza-palace"
                />
                <p className="text-xs text-gray-500 mt-1">Used in URLs, must be unique</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Brief description of the restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Full street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="info@restaurant.com"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Billing Configuration</h4>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pricing Strategy</label>
                  <select
                    value={formData.pricingStrategy}
                    onChange={(e) => setFormData({ ...formData, pricingStrategy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="DYNAMIC">Dynamic Pricing</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taxInclusive}
                      onChange={(e) => setFormData({ ...formData, taxInclusive: e.target.checked })}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm">Tax Inclusive Pricing</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Restaurant is Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingRestaurant
                    ? 'Update Restaurant'
                    : 'Create Restaurant'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {!restaurants || restaurants.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No restaurants found. Create your first restaurant!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        restaurant.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">/{restaurant.slug}</span>
                  </div>

                  {restaurant.description && (
                    <p className="text-gray-600 mb-3">{restaurant.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{restaurant.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Contact:</span>
                      <p className="font-medium">
                        {restaurant.phone} • {restaurant.email}
                      </p>
                    </div>
                    {restaurant.billingConfig && (
                      <>
                        <div>
                          <span className="text-gray-500">Tax Rate:</span>
                          <p className="font-medium">{restaurant.billingConfig.defaultTaxRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Strategy:</span>
                          <p className="font-medium">{restaurant.billingConfig.pricingStrategy}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
