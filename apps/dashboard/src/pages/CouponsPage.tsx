import { useState } from 'react';
import { Card } from '@demo/ui';
import { useRestaurantContext } from '../context/RestaurantContext';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Coupon,
} from '../hooks/useRules';

export function CouponsPage() {
  const { selectedRestaurantId } = useRestaurantContext();
  const { data: coupons, isLoading } = useCoupons(selectedRestaurantId);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    maxDiscount: '',
    minOrderAmount: '',
    isActive: true,
    usageLimit: '',
    perUserLimit: '',
    startDate: '',
    endDate: '',
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

    const data: any = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      isActive: formData.isActive,
      restaurantId: selectedRestaurantId,
      conditions: {
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      },
    };

    if (formData.maxDiscount) data.maxDiscount = parseFloat(formData.maxDiscount);
    if (formData.usageLimit) data.usageLimit = parseInt(formData.usageLimit);
    if (formData.perUserLimit) data.perUserLimit = parseInt(formData.perUserLimit);
    if (formData.startDate) data.startDate = new Date(formData.startDate).toISOString();
    if (formData.endDate) data.endDate = new Date(formData.endDate).toISOString();

    if (editingCoupon) {
      await updateMutation.mutateAsync({ id: editingCoupon.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscount: '',
      minOrderAmount: '',
      isActive: true,
      usageLimit: '',
      perUserLimit: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      minOrderAmount: (coupon.conditions as any)?.minOrderAmount?.toString() || '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || '',
      perUserLimit: coupon.perUserLimit?.toString() || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (confirm(`Delete coupon ${coupon.code}?`)) {
      await deleteMutation.mutateAsync({ id: coupon.id, restaurantId: selectedRestaurantId });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    await updateMutation.mutateAsync({
      id: coupon.id,
      isActive: !coupon.isActive,
      restaurantId: selectedRestaurantId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-md uppercase"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Get 20% off your order"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Order ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Usage Limit (Leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Per User Limit</label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
                  setFormData({
                    code: '',
                    description: '',
                    discountType: 'PERCENTAGE',
                    discountValue: '',
                    maxDiscount: '',
                    minOrderAmount: '',
                    isActive: true,
                    usageLimit: '',
                    perUserLimit: '',
                    startDate: '',
                    endDate: '',
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
          <p>Loading coupons...</p>
        </Card>
      ) : !coupons || coupons.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-2xl font-mono">{coupon.code}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {coupon.description && <p className="text-gray-600 mb-3">{coupon.description}</p>}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Discount:</span>{' '}
                      <span className="font-semibold">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue}`}
                        {coupon.maxDiscount && ` (max $${coupon.maxDiscount})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>{' '}
                      <span className="font-semibold">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                      </span>
                    </div>
                    {(coupon.conditions as any)?.minOrderAmount && (
                      <div>
                        <span className="text-gray-500">Min Order:</span>{' '}
                        <span className="font-semibold">
                          ${(coupon.conditions as any).minOrderAmount}
                        </span>
                      </div>
                    )}
                    {(coupon.startDate || coupon.endDate) && (
                      <div>
                        <span className="text-gray-500">Valid:</span>{' '}
                        <span className="font-semibold">
                          {coupon.startDate && new Date(coupon.startDate).toLocaleDateString()}
                          {coupon.startDate && coupon.endDate && ' - '}
                          {coupon.endDate && new Date(coupon.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`px-3 py-1 rounded ${coupon.isActive ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon)}
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
