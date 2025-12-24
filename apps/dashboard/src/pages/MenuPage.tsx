import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  type MenuItem,
} from '../hooks/useMenu';

export function MenuPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: menuItems, isLoading } = useMenuItems(selectedRestaurantId);
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
    basePrice: '',
    taxCategory: 'food',
    isAvailable: true,
  });

  if (!selectedRestaurantId) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Please select a restaurant first</p>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      restaurantId: selectedRestaurantId,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'main',
      basePrice: '',
      taxCategory: 'food',
      isAvailable: true,
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      basePrice: item.basePrice.toString(),
      taxCategory: item.taxCategory || 'food',
      isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (confirm(`Delete ${item.name}?`)) {
      await deleteMutation.mutateAsync({ id: item.id, restaurantId: selectedRestaurantId });
    }
  };

  const groupedItems =
    menuItems?.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, MenuItem[]>
    ) || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main">Main Course</option>
                  <option value="pizza">Pizza</option>
                  <option value="burger">Burger</option>
                  <option value="sushi">Sushi</option>
                  <option value="sides">Sides</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price ($) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Category</label>
                <select
                  value={formData.taxCategory}
                  onChange={(e) => setFormData({ ...formData, taxCategory: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="food">Food</option>
                  <option value="alcohol">Alcohol</option>
                  <option value="non-alcoholic">Non-Alcoholic</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium">
                Available for ordering
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'main',
                    basePrice: '',
                    taxCategory: 'food',
                    isAvailable: true,
                  });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <p>Loading menu...</p>
        </Card>
      ) : Object.keys(groupedItems).length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No menu items yet. Add your first item!</p>
        </Card>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              {category.charAt(0).toUpperCase() + category.slice(1)} ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      {!item.isAvailable && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Price: ${item.basePrice.toFixed(2)}</span>
                      {item.taxCategory && <span>Tax: {item.taxCategory}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
