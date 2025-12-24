import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRestaurant, useMenu } from '../hooks/useRestaurant';
import { useCartStore } from '../store/cart';
import { Card, Button } from '@demo/ui';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(slug!);
  const { data: menuItems, isLoading: menuLoading } = useMenu(
    restaurant?.id || '',
    selectedCategory
  );

  const { addItem, setRestaurant } = useCartStore();

  useEffect(() => {
    if (restaurant) {
      setRestaurant(restaurant.id, restaurant.name);
    }
  }, [restaurant, setRestaurant]);

  if (restaurantLoading || menuLoading) {
    return <LoadingSpinner message="Loading menu..." />;
  }

  if (!restaurant) {
    return <div className="text-center py-12 text-red-600">Restaurant not found</div>;
  }

  // Get unique categories
  const categories = Array.from(new Set(menuItems?.map((item: any) => item.category) || []));

  const handleAddToCart = (item: any) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
      category: item.category,
      taxCategory: item.taxCategory,
      imageUrl: item.imageUrl,
      restaurantId: restaurant.id,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-gray-600">{restaurant.description}</p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={!selectedCategory ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories.map((category: any) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems?.map((item: any) => (
          <Card key={item.id} className="overflow-hidden">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-lg font-bold text-green-600">
                  ${item.basePrice.toFixed(2)}
                </span>
              </div>

              {item.description && <p className="text-gray-600 text-sm mb-4">{item.description}</p>}

              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</span>

                <Button onClick={() => handleAddToCart(item)} disabled={!item.isAvailable}>
                  {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {menuItems?.length === 0 && (
        <div className="text-center py-12 text-gray-500">No menu items available.</div>
      )}
    </div>
  );
}
