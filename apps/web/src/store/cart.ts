import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  category: string;
  taxCategory?: string;
  imageUrl?: string;
  restaurantId: string;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  couponCode: string | null;
  lastError: string | null;

  // Actions
  setRestaurant: (id: string, name: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  clearError: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],
      couponCode: null,
      lastError: null,

      setRestaurant: (id, name) => set({ restaurantId: id, restaurantName: name }),

      addItem: (item) => {
        const state = get();

        // Validate restaurant consistency
        if (state.restaurantId && state.restaurantId !== item.restaurantId) {
          set({
            lastError: `Cannot add items from ${item.name} - cart contains items from ${state.restaurantName}. Please checkout or clear cart first.`,
          });
          return;
        }

        // Clear any previous errors
        set({ lastError: null });

        const items = state.items;
        const existingItem = items.find((i) => i.menuItemId === item.menuItemId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (menuItemId) => {
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
        } else {
          set({
            items: get().items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
          });
        }
      },

      applyCoupon: (code) => set({ couponCode: code }),

      removeCoupon: () => set({ couponCode: null }),

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          restaurantId: null,
          restaurantName: null,
          lastError: null,
        }),

      clearError: () => set({ lastError: null }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () => get().items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0),
    }),
    {
      name: 'restaurant-cart',
    }
  )
);
