import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

// Simple debug component
export function DebugPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['debug-restaurants'],
    queryFn: async () => {
      console.log('🔍 Fetching restaurants...');
      console.log('API Base URL:', apiClient.defaults.baseURL);
      const response = await apiClient.get('/restaurants');
      console.log('✅ Response:', response.data);
      return response.data;
    },
  });

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md shadow-lg">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>API URL: {apiClient.defaults.baseURL}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Error: {error ? String(error) : 'None'}</div>
        <div>Restaurants: {data ? data.length : '0'}</div>
        {data && data.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold">First restaurant:</div>
            <div>{data[0].name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
