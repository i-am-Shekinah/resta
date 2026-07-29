import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  if (!cart || !cart.items?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="page-heading mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-8">Your cart is empty.</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="page-heading mb-8">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.id} className="card-restaurant p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{item.menu_item_detail?.name}</p>
              <p className="text-sm text-gray-500">${item.menu_item_detail?.price} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateItem(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <p className="font-semibold text-gray-900 w-20 text-right">${item.subtotal}</p>

            <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-brand-600">${cart.total}</span>
        </div>

        <Link to="/checkout" className="btn-primary w-full text-center">
          Proceed to Checkout
        </Link>

        <Link to="/menu" className="btn-ghost mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
