import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card } from '@demo/ui';
import { RestaurantProvider } from './context/RestaurantContext';
import { RestaurantSelector } from './components/RestaurantSelector';
import { DebugPanel } from './components/DebugPanel';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { PricingRulesPage } from './pages/PricingRulesPage';
import { TaxRulesPage } from './pages/TaxRulesPage';
import { DiscountRulesPage } from './pages/DiscountRulesPage';
import { CouponsPage } from './pages/CouponsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RestaurantManagementPage } from './pages/RestaurantManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Dashboard home page
function Dashboard() {
  const sections = [
    {
      name: 'Restaurant Management',
      path: '/restaurants',
      icon: '🏪',
      description: 'Manage restaurant details and settings',
    },
    {
      name: 'Menu Management',
      path: '/menu',
      icon: '🍔',
      description: 'Add, edit, and manage menu items',
    },
    { name: 'Orders', path: '/orders', icon: '📋', description: 'View and manage customer orders' },
    {
      name: 'Pricing Rules',
      path: '/pricing-rules',
      icon: '💰',
      description: 'Configure dynamic pricing strategies',
    },
    { name: 'Tax Rules', path: '/tax-rules', icon: '🧾', description: 'Set up tax configurations' },
    {
      name: 'Discount Rules',
      path: '/discount-rules',
      icon: '🎁',
      description: 'Create discount rules',
    },
    { name: 'Coupons', path: '/coupons', icon: '🎫', description: 'Manage coupon codes' },
    {
      name: 'Settings',
      path: '/settings',
      icon: '⚙️',
      description: 'Restaurant settings and billing config',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="p-6">
                <div className="text-4xl mb-4">{section.icon}</div>
                <h2 className="text-xl font-semibold mb-2">{section.name}</h2>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RestaurantProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <Link to="/" className="text-2xl font-bold text-gray-900">
                    🍽️ Restaurant Admin Dashboard
                  </Link>
                  <RestaurantSelector />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/restaurants" element={<RestaurantManagementPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/pricing-rules" element={<PricingRulesPage />} />
                <Route path="/tax-rules" element={<TaxRulesPage />} />
                <Route path="/discount-rules" element={<DiscountRulesPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>

            {/* <DebugPanel /> */}
          </div>
        </BrowserRouter>
      </RestaurantProvider>
    </QueryClientProvider>
  );
}

export default App;
