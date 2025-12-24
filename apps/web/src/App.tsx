import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RestaurantList from './pages/RestaurantList';
import RestaurantMenu from './pages/RestaurantMenu';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Header from './components/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<RestaurantList />} />
              <Route path="/restaurant/:slug" element={<RestaurantMenu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track" element={<OrderTracking />} />
              <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
