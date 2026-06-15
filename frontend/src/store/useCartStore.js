import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product, quantity = 1) => {
        const { cartItems } = get();
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
          const updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += quantity;
          set({ cartItems: updatedCart });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity }] });
        }
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter(item => item.id !== productId)
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          cartItems: state.cartItems.map(item => 
            item.id === productId ? { ...item, quantity } : item
          )
        }));
      },
      clearCart: () => set({ cartItems: [] }),
      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'moda-hendam-cart', // Unique name for local storage key
    }
  )
);

export default useCartStore;
