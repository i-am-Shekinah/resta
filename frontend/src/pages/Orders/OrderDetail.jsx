import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import client from '../../api/client';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => client.get(`/orders/${id}/`).then((r) => r.data),
  });

  if (!order) return <div className="max-w-3xl mx-auto px-4 py-12">Loading...</div>;

  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <Link to="/orders" className="btn-ghost inline-flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="page-heading">Order #{order.id}</h1>
        <span className={`badge-status text-sm px-3 py-1 ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="card-restaurant p-6 mb-6">
        <h2 className="section-title mb-4">Status</h2>
        <div className="flex items-center gap-2">
          {statusOrder.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i <= currentIdx ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i + 1}
              </div>
              {i < statusOrder.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentIdx ? 'bg-brand-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          {statusOrder.map((s) => (
            <span key={s} className="capitalize">{s}</span>
          ))}
        </div>
      </div>

      <div className="card-restaurant p-6 mb-6">
        <h2 className="section-title mb-4">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm">
            <span>{item.quantity}x {item.menu_item_name}</span>
            <span className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.tax}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-600">${order.total}</span>
          </div>
        </div>
      </div>

      <div className="card-restaurant p-6">
        <h2 className="section-title mb-4">Payment</h2>
        <p className="text-sm text-gray-600">
          Method: <span className="font-medium capitalize">{order.payment_method}</span>
        </p>
        <p className="text-sm text-gray-600">
          Status: <span className={`badge-status ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {order.payment_status}
          </span>
        </p>
      </div>
    </div>
  );
}
