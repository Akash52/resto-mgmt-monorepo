import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import {
  useDiscountRules,
  useCreateDiscountRule,
  useUpdateDiscountRule,
  useDeleteDiscountRule,
  type DiscountRule,
} from '../hooks/useRules';

export function DiscountRulesPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: rules, isLoading } = useDiscountRules(selectedRestaurantId);
  const createMutation = useCreateDiscountRule();
  const updateMutation = useUpdateDiscountRule();
  const deleteMutation = useDeleteDiscountRule();

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    maxDiscount: '',
    priority: '5',
    isActive: true,
    usageLimit: '',
    startDate: '',
    endDate: '',
    conditions: {
      minOrderAmount: '',
      maxOrderAmount: '',
      categories: [] as string[],
      minQuantity: '',
      maxQuantity: '',
      dayOfWeek: [] as number[],
      timeRange: '',
    },
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

    const conditions: any = {};
    if (formData.conditions.minOrderAmount) {
      conditions.minOrderAmount = parseFloat(formData.conditions.minOrderAmount);
    }
    if (formData.conditions.maxOrderAmount) {
      conditions.maxOrderAmount = parseFloat(formData.conditions.maxOrderAmount);
    }
    if (formData.conditions.categories.length > 0) {
      conditions.categories = formData.conditions.categories;
    }
    if (formData.conditions.minQuantity) {
      conditions.minQuantity = parseInt(formData.conditions.minQuantity);
    }
    if (formData.conditions.maxQuantity) {
      conditions.maxQuantity = parseInt(formData.conditions.maxQuantity);
    }
    if (formData.conditions.dayOfWeek.length > 0) {
      conditions.dayOfWeek = formData.conditions.dayOfWeek;
    }
    if (formData.conditions.timeRange) {
      conditions.timeRange = formData.conditions.timeRange;
    }

    const data = {
      restaurantId: selectedRestaurantId,
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      value: parseFloat(formData.value),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      priority: parseInt(formData.priority),
      isActive: formData.isActive,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      conditions,
    };

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({ id: editingRule.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save discount rule:', error);
    }
  };

  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      value: rule.value.toString(),
      maxDiscount: rule.maxDiscount?.toString() || '',
      priority: rule.priority.toString(),
      isActive: rule.isActive,
      usageLimit: rule.usageLimit?.toString() || '',
      startDate: rule.startDate ? rule.startDate.split('T')[0] : '',
      endDate: rule.endDate ? rule.endDate.split('T')[0] : '',
      conditions: {
        minOrderAmount: rule.conditions?.minOrderAmount?.toString() || '',
        maxOrderAmount: rule.conditions?.maxOrderAmount?.toString() || '',
        categories: rule.conditions?.categories || [],
        minQuantity: rule.conditions?.minQuantity?.toString() || '',
        maxQuantity: rule.conditions?.maxQuantity?.toString() || '',
        dayOfWeek: rule.conditions?.dayOfWeek || [],
        timeRange: rule.conditions?.timeRange || '',
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this discount rule?')) {
      await deleteMutation.mutateAsync({ id, restaurantId: selectedRestaurantId });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      maxDiscount: '',
      priority: '5',
      isActive: true,
      usageLimit: '',
      startDate: '',
      endDate: '',
      conditions: {
        minOrderAmount: '',
        maxOrderAmount: '',
        categories: [],
        minQuantity: '',
        maxQuantity: '',
        dayOfWeek: [],
        timeRange: '',
      },
    });
  };

  const addCategory = (category: string) => {
    if (category && !formData.conditions.categories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          categories: [...prev.conditions.categories, category],
        },
      }));
    }
  };

  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        categories: prev.conditions.categories.filter((c) => c !== category),
      },
    }));
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        dayOfWeek: prev.conditions.dayOfWeek.includes(day)
          ? prev.conditions.dayOfWeek.filter((d) => d !== day)
          : [...prev.conditions.dayOfWeek, day],
      },
    }));
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discount Rules</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create Rule'}
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRule ? 'Edit Discount Rule' : 'Create New Discount Rule'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Large Order Discount, Combo Deal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">Higher priority applies first</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe when this discount applies"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value * {formData.type === 'PERCENTAGE' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={formData.type === 'PERCENTAGE' ? '15' : '10.00'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Optional cap"
                />
                <p className="text-xs text-gray-500 mt-1">For percentage discounts</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Discount Conditions</h4>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.conditions.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, minOrderAmount: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., 50.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Order Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.conditions.maxOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, maxOrderAmount: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional max"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.conditions.minQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, minQuantity: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.conditions.maxQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, maxQuantity: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Menu Categories (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addCategory(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">Add category...</option>
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
                  <div className="flex flex-wrap gap-2">
                    {formData.conditions.categories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Days of Week (Optional)</label>
                  <div className="flex gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayOfWeek(index + 1)}
                        className={`px-3 py-2 rounded text-sm ${
                          formData.conditions.dayOfWeek.includes(index + 1)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select specific days when discount applies
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Range (Optional)</label>
                  <input
                    type="text"
                    value={formData.conditions.timeRange}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditions: { ...formData.conditions, timeRange: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 16:00-19:00"
                  />
                  <p className="text-xs text-gray-500 mt-1">24-hour format, e.g., 16:00-19:00</p>
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
                Rule is Active
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
                  : editingRule
                    ? 'Update Rule'
                    : 'Create Rule'}
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

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2">💡 About Discount Rules</h3>
        <p className="text-sm text-gray-700 mb-2">
          Automatic discounts applied based on order conditions. Examples: Bulk order discounts,
          Combo deals, First-time customer discounts.
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • <strong>Priority:</strong> Higher priority rules apply first (0-10)
          </li>
          <li>
            • <strong>Min/Max Order:</strong> Apply based on total order value
          </li>
          <li>
            • <strong>Quantity Conditions:</strong> Apply based on item quantities
          </li>
          <li>
            • <strong>Category Filters:</strong> Apply only to specific menu categories
          </li>
          <li>
            • <strong>Time/Day Restrictions:</strong> Limit to specific times or days
          </li>
        </ul>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <p>Loading discount rules...</p>
        </Card>
      ) : !rules || rules.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No discount rules configured yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {rule.type === 'PERCENTAGE' ? `${rule.value}%` : `$${rule.value}`} off
                      {rule.maxDiscount && ` (max $${rule.maxDiscount})`}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Priority: {rule.priority}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  )}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Conditions:</div>
                    <div className="bg-gray-100 p-3 rounded">
                      {rule.conditions && Object.keys(rule.conditions).length > 0 ? (
                        <div className="space-y-2">
                          {rule.conditions.minOrderAmount && (
                            <div>
                              <span className="font-medium">Min Order: </span>
                              <span>${rule.conditions.minOrderAmount}</span>
                            </div>
                          )}
                          {rule.conditions.maxOrderAmount && (
                            <div>
                              <span className="font-medium">Max Order: </span>
                              <span>${rule.conditions.maxOrderAmount}</span>
                            </div>
                          )}
                          {rule.conditions.minQuantity && (
                            <div>
                              <span className="font-medium">Min Quantity: </span>
                              <span>{rule.conditions.minQuantity}</span>
                            </div>
                          )}
                          {rule.conditions.categories && rule.conditions.categories.length > 0 && (
                            <div>
                              <span className="font-medium">Categories: </span>
                              <span className="text-blue-700">
                                {rule.conditions.categories.join(', ')}
                              </span>
                            </div>
                          )}
                          {rule.conditions.dayOfWeek && rule.conditions.dayOfWeek.length > 0 && (
                            <div>
                              <span className="font-medium">Days: </span>
                              <span>
                                {rule.conditions.dayOfWeek
                                  .map((d: number) => dayNames[d - 1])
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                          {rule.conditions.timeRange && (
                            <div>
                              <span className="font-medium">Time: </span>
                              <span>{rule.conditions.timeRange}</span>
                            </div>
                          )}
                          {rule.usageLimit && (
                            <div>
                              <span className="font-medium">Usage Limit: </span>
                              <span>
                                {rule.usageCount || 0}/{rule.usageLimit}
                              </span>
                            </div>
                          )}
                          {(rule.startDate || rule.endDate) && (
                            <div>
                              <span className="font-medium">Valid: </span>
                              <span>
                                {rule.startDate && new Date(rule.startDate).toLocaleDateString()}
                                {rule.startDate && rule.endDate && ' - '}
                                {rule.endDate && new Date(rule.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">All orders</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
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
