import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);

  function fetchCart() {
    return client.get('/cart/').then(({ data }) => {
      setCart(data);
      const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
      return data;
    });
  }

  function addItem(menuItemId, quantity = 1, modifiers = []) {
    return client.post('/cart/add/', { menu_item: menuItemId, quantity, modifiers }).then(({ data }) => {
      setCart(data);
      const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
      return data;
    });
  }

  function updateItem(itemId, quantity) {
    return client.patch(`/cart/items/${itemId}/`, { quantity }).then(fetchCart);
  }

  function removeItem(itemId) {
    return client.delete(`/cart/items/${itemId}/`).then(fetchCart);
  }

  function clearCart() {
    return client.delete('/cart/clear/').then(() => {
      setCart(null);
      setItemCount(0);
    });
  }

  return (
    <CartContext.Provider value={{ cart, itemCount, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
