import { useRestaurants } from '../hooks/useRestaurant';
import { Link } from 'react-router-dom';
import { Card } from '@demo/ui';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RestaurantList() {
  const { data: restaurants, isLoading, error } = useRestaurants();

  if (isLoading) {
    return <LoadingSpinner message="Loading restaurants..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load restaurants. Please try again.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Choose a Restaurant</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant: any) => (
          <Link key={restaurant.id} to={`/restaurant/${restaurant.slug}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
                {restaurant.description && (
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                )}
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {restaurant.address}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {restaurant.phone}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {restaurants?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No restaurants available at the moment.
        </div>
      )}
    </div>
  );
}
