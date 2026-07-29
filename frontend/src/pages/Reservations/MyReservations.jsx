import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

export default function MyReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState(null);

  const { data: reservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => client.get('/reservations/my/').then((r) => r.data),
    enabled: !!user,
  });

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await client.patch(`/reservations/${id}/`, { status: 'cancelled' });
      toast.success('Reservation cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    } catch (err) {
      const data = err.response?.data;
      const message = data?.non_field_errors?.[0] || Object.values(data || {}).flat().find(Boolean) || 'Failed to cancel';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="page-heading mb-4">My Reservations</h1>
        <p className="text-gray-500">Sign in to view your reservations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="page-heading mb-8">My Reservations</h1>

      {!reservations?.length ? (
        <p className="text-gray-500">No reservations yet.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="card-restaurant p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Table {r.table_detail?.number || r.table} &middot; {r.party_size} {r.party_size === 1 ? 'guest' : 'guests'}
                </p>
                <p className="text-sm text-gray-500">
                  {r.date} at {r.time.slice(0, 5)}
                </p>
                {r.notes && <p className="text-sm text-gray-400 mt-1">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                {['pending', 'confirmed'].includes(r.status) && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={cancellingId === r.id}
                    className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                <span className={`badge-status ${statusColors[r.status] || 'bg-gray-100'}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
