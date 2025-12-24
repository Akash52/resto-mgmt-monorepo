import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import {
  useTaxRules,
  useCreateTaxRule,
  useUpdateTaxRule,
  useDeleteTaxRule,
  type TaxRule,
} from '../hooks/useRules';

export function TaxRulesPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: rules, isLoading } = useTaxRules(selectedRestaurantId);
  const createMutation = useCreateTaxRule();
  const updateMutation = useUpdateTaxRule();
  const deleteMutation = useDeleteTaxRule();

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rate: '',
    applicationType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    priority: '5',
    isCompound: false,
    isActive: true,
    conditions: {
      taxCategories: [] as string[],
      categories: [] as string[],
      minAmount: '',
      maxAmount: '',
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
    if (formData.conditions.taxCategories.length > 0) {
      conditions.taxCategories = formData.conditions.taxCategories;
    }
    if (formData.conditions.categories.length > 0) {
      conditions.categories = formData.conditions.categories;
    }
    if (formData.conditions.minAmount) {
      conditions.minAmount = parseFloat(formData.conditions.minAmount);
    }
    if (formData.conditions.maxAmount) {
      conditions.maxAmount = parseFloat(formData.conditions.maxAmount);
    }

    const data = {
      restaurantId: selectedRestaurantId,
      name: formData.name,
      description: formData.description || undefined,
      rate: parseFloat(formData.rate),
      applicationType: formData.applicationType,
      priority: parseInt(formData.priority),
      isCompound: formData.isCompound,
      isActive: formData.isActive,
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
      console.error('Failed to save tax rule:', error);
    }
  };

  const handleEdit = (rule: TaxRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      rate: rule.rate.toString(),
      applicationType: rule.applicationType,
      priority: rule.priority.toString(),
      isCompound: rule.isCompound,
      isActive: rule.isActive,
      conditions: {
        taxCategories: rule.conditions?.taxCategories || [],
        categories: rule.conditions?.categories || [],
        minAmount: rule.conditions?.minAmount?.toString() || '',
        maxAmount: rule.conditions?.maxAmount?.toString() || '',
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this tax rule?')) {
      await deleteMutation.mutateAsync({ id, restaurantId: selectedRestaurantId });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      rate: '',
      applicationType: 'PERCENTAGE',
      priority: '5',
      isCompound: false,
      isActive: true,
      conditions: {
        taxCategories: [],
        categories: [],
        minAmount: '',
        maxAmount: '',
      },
    });
  };

  const addTaxCategory = (category: string) => {
    if (category && !formData.conditions.taxCategories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          taxCategories: [...prev.conditions.taxCategories, category],
        },
      }));
    }
  };

  const removeTaxCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        taxCategories: prev.conditions.taxCategories.filter((c) => c !== category),
      },
    }));
  };

  const addMenuCategory = (category: string) => {
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

  const removeMenuCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        categories: prev.conditions.categories.filter((c) => c !== category),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tax Rules</h2>
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
            {editingRule ? 'Edit Tax Rule' : 'Create New Tax Rule'}
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
                  placeholder="e.g., Food Tax, Alcohol Tax"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="8.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe when this tax rule applies"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Application Type *</label>
                <select
                  value={formData.applicationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationType: e.target.value as 'PERCENTAGE' | 'FIXED',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
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
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCompound"
                    checked={formData.isCompound}
                    onChange={(e) => setFormData({ ...formData, isCompound: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isCompound" className="text-sm font-medium">
                    Compound Tax
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Apply after other taxes</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Tax Application Conditions</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tax Categories</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addTaxCategory(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">Add tax category...</option>
                      <option value="food">Food</option>
                      <option value="alcohol">Alcohol</option>
                      <option value="non-alcoholic">Non-Alcoholic</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.conditions.taxCategories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeTaxCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
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
                          addMenuCategory(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">Add menu category...</option>
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
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeMenuCategory(category)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.conditions.minAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, minAmount: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional minimum amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.conditions.maxAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, maxAmount: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional maximum amount"
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
        <h3 className="font-semibold mb-2">💡 About Tax Rules</h3>
        <p className="text-sm text-gray-700 mb-2">
          Configure tax rates for different categories (food, alcohol, etc.). Supports compound
          taxes for complex scenarios.
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • <strong>Priority:</strong> Higher priority rules apply first (0-10)
          </li>
          <li>
            • <strong>Compound Tax:</strong> Applied after other taxes are calculated
          </li>
          <li>
            • <strong>Tax Categories:</strong> Apply to items with specific tax categories
          </li>
          <li>
            • <strong>Menu Categories:</strong> Apply to items in specific menu categories
          </li>
        </ul>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <p>Loading tax rules...</p>
        </Card>
      ) : !rules || rules.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No tax rules configured yet.</p>
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
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {rule.rate}% {rule.applicationType}
                    </span>
                    {rule.isCompound && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        Compound
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Priority: {rule.priority}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  )}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Applies to:</div>
                    <div className="bg-gray-100 p-3 rounded">
                      {rule.conditions && Object.keys(rule.conditions).length > 0 ? (
                        <div className="space-y-2">
                          {rule.conditions.taxCategories && (
                            <div>
                              <span className="font-medium">Tax Categories: </span>
                              <span className="text-blue-700">
                                {rule.conditions.taxCategories.join(', ')}
                              </span>
                            </div>
                          )}
                          {rule.conditions.categories && (
                            <div>
                              <span className="font-medium">Menu Categories: </span>
                              <span className="text-green-700">
                                {rule.conditions.categories.join(', ')}
                              </span>
                            </div>
                          )}
                          {rule.conditions.minAmount && (
                            <div>
                              <span className="font-medium">Min Amount: </span>
                              <span>${rule.conditions.minAmount}</span>
                            </div>
                          )}
                          {rule.conditions.maxAmount && (
                            <div>
                              <span className="font-medium">Max Amount: </span>
                              <span>${rule.conditions.maxAmount}</span>
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
