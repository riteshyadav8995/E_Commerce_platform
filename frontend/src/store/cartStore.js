import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import useAuthStore from './authStore';

const syncCartToBackend = async (cartItems) => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    try {
      await api.post('/cart/sync', { cartItems });
    } catch (error) {
      console.error('Failed to sync cart to backend:', error);
    }
  }
};

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id);
          let newCart;
          if (existing) {
            newCart = state.cart.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            newCart = [...state.cart, { product, quantity }];
          }
          syncCartToBackend(newCart);
          return { cart: newCart };
        });
      },

      updateQuantity: (productId, delta) => {
        set((state) => {
          const newCart = state.cart
            .map((item) => {
              if (item.product.id === productId) {
                return { ...item, quantity: item.quantity + delta };
              }
              return item;
            })
            .filter((item) => item.quantity > 0);
          syncCartToBackend(newCart);
          return { cart: newCart };
        });
      },

      clearCart: () => {
        set({ cart: [] });
        syncCartToBackend([]);
      },
      
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + parseFloat(item.product.price) * item.quantity,
          0
        );
      },
      
      getCartCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'luxestore-cart', // unique name for localStorage key
    }
  )
);

export default useCartStore;
