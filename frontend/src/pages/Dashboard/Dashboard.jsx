import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Overview', end: true },
  { path: '/dashboard/menu', label: 'Menu' },
  { path: '/dashboard/orders', label: 'Orders' },
  { path: '/dashboard/reservations', label: 'Reservations' },
  { path: '/dashboard/tables', label: 'Tables' },
];

function Overview() {
  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => client.get('/orders/').then((r) => r.data?.results || []),
  });

  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">Overview</h2>
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="card-restaurant p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold">{orders?.length || 0}</p>
        </div>
        <div className="card-restaurant p-6">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card-restaurant p-6">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
      </div>
    </div>
  );
}

function MenuManager() {
  const { data: items, refetch } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: () => client.get('/menu/items/').then((r) => r.data?.results || []),
  });

  async function toggleAvailability(slug, current) {
    try {
      await client.patch(`/menu/items/${slug}/`, { is_available: !current });
      refetch();
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">Menu Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 font-medium text-gray-500">Name</th>
              <th className="pb-3 font-medium text-gray-500">Price</th>
              <th className="pb-3 font-medium text-gray-500">Featured</th>
              <th className="pb-3 font-medium text-gray-500">Available</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3">{item.name}</td>
                <td className="py-3">${item.price}</td>
                <td className="py-3">{item.is_featured ? 'Yes' : 'No'}</td>
                <td className="py-3">
                  <button
                    onClick={() => toggleAvailability(item.slug, item.is_available)}
                    className={`badge-status cursor-pointer ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {item.is_available ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function OrdersManager() {
  const { data: orders, refetch } = useQuery({
    queryKey: ['admin-orders-manage'],
    queryFn: () => client.get('/orders/').then((r) => r.data?.results || []),
  });

  async function updateStatus(id, status) {
    try {
      await client.patch(`/orders/${id}/status/`, { status });
      refetch();
      toast.success(`Order #${id} → ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">Orders</h2>
      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="card-restaurant p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Order #{order.id} — {order.user}</span>
              <div className="flex items-center gap-2">
                <span className={`badge-status ${statusColors[order.status]}`}>{order.status}</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                >
                  {['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500">${order.total} — {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationsManager() {
  const { data: reservations, refetch } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => client.get('/reservations/').then((r) => r.data?.results || []),
  });

  async function updateStatus(id, status) {
    try {
      await client.patch(`/reservations/${id}/`, { status });
      refetch();
      toast.success(`Reservation ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">Reservations</h2>
      <div className="space-y-4">
        {reservations?.map((r) => (
          <div key={r.id} className="card-restaurant p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{r.customer_email}</p>
                <p className="text-sm text-gray-500">{r.date} at {r.time} — {r.party_size} guests</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge-status ${statusColors[r.status] || 'bg-gray-100'}`}>{r.status}</span>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                >
                  {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablesManager() {
  const { data: tables, refetch } = useQuery({
    queryKey: ['admin-tables'],
    queryFn: () => client.get('/tables/').then((r) => r.data?.results || []),
  });

  async function updateTable(id, field, value) {
    try {
      await client.patch(`/tables/${id}/`, { [field]: value });
      refetch();
      toast.success('Table updated');
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">Tables</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables?.map((table) => (
          <div key={table.id} className="card-restaurant p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Table {table.number}</h3>
              <span className={`badge-status ${table.status === 'available' ? 'bg-green-100 text-green-800' : table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {table.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{table.capacity} seats — {table.location}</p>
            <select
              value={table.status}
              onChange={(e) => updateTable(table.id, 'status', e.target.value)}
              className="mt-2 text-sm border border-gray-300 rounded-lg px-2 py-1 w-full"
            >
              {['available', 'reserved', 'occupied'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !['admin', 'staff'].includes(user.role)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="page-heading mb-4">Access Denied</h1>
        <p className="text-gray-500">You need admin or staff privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="page-heading mb-8">Dashboard</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {navItems.map((item) => {
          const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <Routes>
        <Route index element={<Overview />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="reservations" element={<ReservationsManager />} />
        <Route path="tables" element={<TablesManager />} />
      </Routes>
    </div>
  );
}
