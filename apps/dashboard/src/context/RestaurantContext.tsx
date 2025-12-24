import { createContext, useContext, useState, ReactNode } from 'react';

interface RestaurantContextType {
  selectedRestaurantId: string | null;
  selectedRestaurantSlug: string | null;
  setSelectedRestaurant: (id: string | null, slug: string | null) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState<string | null>(null);

  const setSelectedRestaurant = (id: string | null, slug: string | null) => {
    setSelectedRestaurantId(id);
    setSelectedRestaurantSlug(slug);
  };

  return (
    <RestaurantContext.Provider
      value={{
        selectedRestaurantId,
        selectedRestaurantSlug,
        setSelectedRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantContext must be used within RestaurantProvider');
  }
  return context;
}
