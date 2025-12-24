import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import ErrorAlert from './ErrorAlert';

export default function Header() {
  const { itemCount, restaurantName, lastError, clearError } = useCartStore();

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              🍽️ Restaurant Orders
            </Link>

            <div className="flex items-center gap-4">
              {restaurantName && (
                <div className="text-sm text-gray-600">
                  Ordering from: <span className="font-semibold">{restaurantName}</span>
                </div>
              )}

              <Link
                to="/track"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Track Order
              </Link>

              <Link
                to="/checkout"
                className="relative inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Cart
                {itemCount() > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-semibold">
                    {itemCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {lastError && (
        <div className="container mx-auto px-4 pt-4">
          <ErrorAlert message={lastError} onClose={clearError} />
        </div>
      )}
    </>
  );
}
