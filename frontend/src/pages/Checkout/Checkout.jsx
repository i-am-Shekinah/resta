import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, fetchCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  if (!cart || !cart.items?.length) {
    navigate('/cart');
    return null;
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const { data } = await client.post('/orders/checkout/', { notes });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="page-heading mb-8">Checkout</h1>

      <div className="card-restaurant p-6 mb-6">
        <h2 className="section-title mb-4">Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              {item.quantity}x {item.menu_item_detail?.name}
            </span>
            <span className="font-medium">${item.subtotal}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${cart.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>${(cart.total * 0.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2">
            <span>Total</span>
            <span className="text-brand-600">${(cart.total * 1.08).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card-restaurant p-6 mb-6">
        <h2 className="section-title mb-4">Payment</h2>
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-1">Dummy Payment</p>
          <p>No real payment will be processed. This is a placeholder flow.</p>
        </div>
      </div>

      <div className="card-restaurant p-6 mb-8">
        <h2 className="section-title mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or dietary notes..."
          className="input-field"
          rows={3}
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full text-lg py-4"
      >
        {loading ? 'Placing Order...' : 'Place Order — Pay at Restaurant'}
      </button>
    </div>
  );
}
