import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import SearchFilter from '../../components/SearchFilter';
import useDebounce from '../../hooks/useDebounce';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const debouncedSearch = useDebounce(search);

  const params = {};
  if (debouncedSearch) params.search = debouncedSearch;
  if (statusFilter) params.status = statusFilter;
  params.ordering = sortDir === 'desc' ? `-${sortField}` : sortField;

  const { data: orders } = useQuery({
    queryKey: ['orders', debouncedSearch, statusFilter, sortField, sortDir],
    queryFn: () => client.get('/orders/', { params }).then((r) => r.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="page-heading mb-4">My Orders</h1>
        <p className="text-gray-500">Sign in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="page-heading mb-8">My Orders</h1>

      <div className="mb-6">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search orders..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: '', label: 'All statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'preparing', label: 'Preparing' },
                { value: 'ready', label: 'Ready' },
                { value: 'served', label: 'Served' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
          ]}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortFields={[
            { value: 'created_at', label: 'Date' },
            { value: 'total', label: 'Total' },
          ]}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
        />
      </div>

      {!orders?.results?.length ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.results.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card-restaurant p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className={`badge-status ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status}
                </span>
                <p className="text-sm font-semibold mt-1">${order.total}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
