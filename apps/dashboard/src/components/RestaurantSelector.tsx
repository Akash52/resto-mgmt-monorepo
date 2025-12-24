import { useRestaurants } from '../hooks/useRestaurants';
import { useRestaurantContext } from '../context/RestaurantContext';
import { useEffect } from 'react';

export function RestaurantSelector() {
  const { data: restaurants, isLoading } = useRestaurants();
  const { selectedRestaurantId, setSelectedRestaurant } = useRestaurantContext();

  console.log('🏪 RestaurantSelector render:', { restaurants, isLoading, selectedRestaurantId });

  // Auto-select first restaurant if none selected
  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      console.log('🎯 Auto-selecting first restaurant:', restaurants[0].name);
      setSelectedRestaurant(restaurants[0].id, restaurants[0].slug);
    }
  }, [restaurants, selectedRestaurantId, setSelectedRestaurant]);

  if (isLoading) return <div className="text-sm text-gray-500">Loading restaurants...</div>;
  if (!restaurants || restaurants.length === 0) {
    return <div className="text-sm text-red-500">No restaurants found</div>;
  }

  const handleRestaurantChange = (restaurantId: string) => {
    const selectedRestaurant = restaurants.find((r) => r.id === restaurantId);
    if (selectedRestaurant) {
      setSelectedRestaurant(selectedRestaurant.id, selectedRestaurant.slug);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Restaurant:</label>
      <select
        value={selectedRestaurantId || ''}
        onChange={(e) => handleRestaurantChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>
            {restaurant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
