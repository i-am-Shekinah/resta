import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function MenuItemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const { data: item } = useQuery({
    queryKey: ['menu-item', slug],
    queryFn: () => client.get(`/menu/items/${slug}/`).then((r) => r.data),
  });

  if (!item) return <div className="max-w-3xl mx-auto px-4 py-12">Loading...</div>;

  function toggleModifier(modId) {
    setSelectedModifiers((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  }

  async function handleAddToCart() {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    try {
      await addItem(item.id, quantity, selectedModifiers.map((id) => ({ id })));
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <div className="aspect-[2/1] rounded-xl mb-8 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex flex-col items-center justify-center gap-2">
            <UtensilsCrossed className="w-14 h-14 text-brand-400" />
            <span className="text-sm font-medium text-brand-500">{item.name}</span>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-display font-bold mb-2">{item.name}</h1>
      <p className="text-2xl text-brand-600 font-bold mb-4">${item.price}</p>
      <p className="text-gray-600 mb-8">{item.description}</p>

      {item.modifiers?.length > 0 && (
        <div className="mb-8">
          <h3 className="section-title mb-3">Add-ons & Modifiers</h3>
          <div className="space-y-2">
            {item.modifiers.map((mod) => (
              <label key={mod.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-brand-300 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedModifiers.includes(mod.id)}
                    onChange={() => toggleModifier(mod.id)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{mod.name}</span>
                </div>
                <span className="text-sm text-gray-500">+${mod.price}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-3 font-medium min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>

        <button onClick={handleAddToCart} className="btn-primary flex-1">
          Add to Cart — ${(item.price * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
