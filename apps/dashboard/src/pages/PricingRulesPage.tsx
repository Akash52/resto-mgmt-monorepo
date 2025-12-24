import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import {
  usePricingRules,
  useCreatePricingRule,
  useUpdatePricingRule,
  useDeletePricingRule,
  type PricingRule,
} from '../hooks/useRules';

export function PricingRulesPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: rules, isLoading } = usePricingRules(selectedRestaurantId);
  const createMutation = useCreatePricingRule();
  const updateMutation = useUpdatePricingRule();
  const deleteMutation = useDeletePricingRule();

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'HAPPY_HOUR' as
      | 'HAPPY_HOUR'
      | 'LUNCH_SPECIAL'
      | 'WEEKEND_PRICING'
      | 'SEASONAL'
      | 'CUSTOM',
    priority: '5',
    isActive: true,
    conditions: {
      dayOfWeek: [] as number[],
      timeRange: '',
      categories: [] as string[],
      minOrderAmount: '',
      maxOrderAmount: '',
    },
    action: {
      type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'MARKUP' | 'MARKDOWN',
      value: '',
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
    if (formData.conditions.dayOfWeek.length > 0) {
      conditions.dayOfWeek = formData.conditions.dayOfWeek;
    }
    if (formData.conditions.timeRange) {
      conditions.timeRange = formData.conditions.timeRange;
    }
    if (formData.conditions.categories.length > 0) {
      conditions.categories = formData.conditions.categories;
    }
    if (formData.conditions.minOrderAmount) {
      conditions.minOrderAmount = parseFloat(formData.conditions.minOrderAmount);
    }
    if (formData.conditions.maxOrderAmount) {
      conditions.maxOrderAmount = parseFloat(formData.conditions.maxOrderAmount);
    }

    const action = {
      type: formData.action.type,
      value: parseFloat(formData.action.value),
    };

    const data = {
      restaurantId: selectedRestaurantId,
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      priority: parseInt(formData.priority),
      isActive: formData.isActive,
      conditions,
      action,
    };

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({ id: editingRule.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save pricing rule:', error);
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      priority: rule.priority.toString(),
      isActive: rule.isActive,
      conditions: {
        dayOfWeek: rule.conditions?.dayOfWeek || [],
        timeRange: rule.conditions?.timeRange || '',
        categories: rule.conditions?.categories || [],
        minOrderAmount: rule.conditions?.minOrderAmount?.toString() || '',
        maxOrderAmount: rule.conditions?.maxOrderAmount?.toString() || '',
      },
      action: {
        type: rule.action?.type || 'PERCENTAGE',
        value: rule.action?.value?.toString() || '',
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this pricing rule?')) {
      await deleteMutation.mutateAsync({ id, restaurantId: selectedRestaurantId });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'HAPPY_HOUR',
      priority: '5',
      isActive: true,
      conditions: {
        dayOfWeek: [],
        timeRange: '',
        categories: [],
        minOrderAmount: '',
        maxOrderAmount: '',
      },
      action: {
        type: 'PERCENTAGE',
        value: '',
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

  const ruleTypeDescriptions = {
    HAPPY_HOUR: 'Time-based pricing for specific hours',
    LUNCH_SPECIAL: 'Special pricing during lunch hours',
    WEEKEND_PRICING: 'Weekend and holiday pricing adjustments',
    SEASONAL: 'Seasonal promotions and pricing',
    CUSTOM: 'Custom pricing rule with specific conditions',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pricing Rules</h2>
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
            {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
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
                  placeholder="e.g., Happy Hour Beverages"
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
                placeholder="Describe when and how this pricing rule applies"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="HAPPY_HOUR">Happy Hour</option>
                  <option value="LUNCH_SPECIAL">Lunch Special</option>
                  <option value="WEEKEND_PRICING">Weekend Pricing</option>
                  <option value="SEASONAL">Seasonal</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{ruleTypeDescriptions[formData.type]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action Type *</label>
                <select
                  value={formData.action.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action: { ...formData.action, type: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage Change</option>
                  <option value="FIXED_AMOUNT">Fixed Amount Change</option>
                  <option value="MARKUP">Markup</option>
                  <option value="MARKDOWN">Markdown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price Change Value *{formData.action.type === 'PERCENTAGE' && ' (%)'}
                {formData.action.type === 'FIXED_AMOUNT' && ' ($)'}
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.action.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    action: { ...formData.action, value: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder={
                  formData.action.type === 'PERCENTAGE'
                    ? 'e.g., -25 (for 25% discount) or 10 (for 10% increase)'
                    : 'e.g., -5.00 (for $5 discount) or 3.00 (for $3 increase)'
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Use negative values for discounts, positive for surcharges
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Pricing Conditions</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Days of Week (Optional)</label>
                  <div className="flex gap-2 mb-2">
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
                  <p className="text-xs text-gray-500">
                    Select specific days when pricing applies (1=Monday, 7=Sunday)
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
                  <p className="text-xs text-gray-500 mt-1">
                    24-hour format, e.g., 16:00-19:00 for 4-7 PM
                  </p>
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
                      placeholder="Optional minimum"
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
                      placeholder="Optional maximum"
                    />
                  </div>
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
        <h3 className="font-semibold mb-2">💡 About Pricing Rules</h3>
        <p className="text-sm text-gray-700 mb-2">
          Pricing rules allow you to dynamically adjust menu item prices based on time, day, or
          other conditions.
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Rule Types:</strong>
          </p>
          <ul className="ml-4 space-y-1">
            <li>
              • <strong>Happy Hour:</strong> Time-based discounts (e.g., 4-7 PM beverages)
            </li>
            <li>
              • <strong>Lunch Special:</strong> Lunch-time pricing adjustments
            </li>
            <li>
              • <strong>Weekend Pricing:</strong> Weekend surcharges or discounts
            </li>
            <li>
              • <strong>Seasonal:</strong> Holiday or seasonal promotions
            </li>
            <li>
              • <strong>Custom:</strong> Any other specific conditions
            </li>
          </ul>
          <p className="mt-2">
            <strong>Priority:</strong> Higher priority rules (0-10) apply first
          </p>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <p>Loading pricing rules...</p>
        </Card>
      ) : !rules || rules.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500 mb-4">No pricing rules configured yet.</p>
          <p className="text-sm text-gray-600">
            Create your first pricing rule to implement dynamic pricing strategies.
          </p>
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {rule.type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {rule.action?.type}: {rule.action?.value > 0 ? '+' : ''}
                      {rule.action?.value}
                      {rule.action?.type === 'PERCENTAGE' ? '%' : '$'}
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
                          {rule.conditions.categories && rule.conditions.categories.length > 0 && (
                            <div>
                              <span className="font-medium">Categories: </span>
                              <span className="text-blue-700">
                                {rule.conditions.categories.join(', ')}
                              </span>
                            </div>
                          )}
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
                        </div>
                      ) : (
                        <span className="text-gray-500">All items</span>
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
