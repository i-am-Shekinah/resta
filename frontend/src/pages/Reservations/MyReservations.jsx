import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FilterBar from '../../components/FilterBar';
import QuickFilterPopover from '../../components/QuickFilterPopover';
import AdvancedFilterModal from '../../components/AdvancedFilterModal';
import useDebounce from '../../hooks/useDebounce';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

function statusOptions(selected) {
  return [
    { value: 'pending', label: 'Pending', checked: selected.includes('pending') },
    { value: 'confirmed', label: 'Confirmed', checked: selected.includes('confirmed') },
    { value: 'completed', label: 'Completed', checked: selected.includes('completed') },
    { value: 'cancelled', label: 'Cancelled', checked: selected.includes('cancelled') },
  ];
}

export default function MyReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState(null);
  const [search, setSearch] = useState('');
  const [quickStatus, setQuickStatus] = useState([]);
  const [advancedRules, setAdvancedRules] = useState([]);
  const [showQuickFilter, setShowQuickFilter] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortDir, setSortDir] = useState('asc');
  const debouncedSearch = useDebounce(search);

  const params = {};
  if (debouncedSearch) params.search = debouncedSearch;
  if (quickStatus.length) params.status = quickStatus.join(',');
  if (advancedRules.length) params.filters = JSON.stringify(advancedRules);
  params.ordering = sortDir === 'desc' ? '-date' : 'date';

  const { data: reservations } = useQuery({
    queryKey: ['my-reservations', debouncedSearch, quickStatus, advancedRules, sortDir],
    queryFn: () => client.get('/reservations/my/', { params }).then((r) => r.data),
    enabled: !!user,
  });

  function handleQuickStatusToggle(value, checked) {
    setQuickStatus((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  }

  function resetQuickFilters() {
    setQuickStatus([]);
  }

  function handleApplyAdvanced(rules) {
    setAdvancedRules(rules);
  }

  function toggleQuickFilter() {
    setShowQuickFilter((v) => !v);
    setShowAdvanced(false);
  }

  function toggleAdvanced() {
    setShowAdvanced((v) => !v);
    setShowQuickFilter(false);
  }

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

      <div className="mb-6 relative">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reservations..."
          sortDir={sortDir}
          onSortDirChange={setSortDir}
          quickFilterActive={quickStatus.length > 0}
          onQuickFilterToggle={toggleQuickFilter}
          advancedActive={advancedRules.length > 0}
          onAdvancedToggle={toggleAdvanced}
          onClearAdvanced={() => setAdvancedRules([])}
        />

        <QuickFilterPopover
          open={showQuickFilter}
          onClose={() => setShowQuickFilter(false)}
          sections={[
            {
              id: 'status',
              label: 'Status',
              options: statusOptions(quickStatus),
              onChange: handleQuickStatusToggle,
            },
          ]}
          onReset={resetQuickFilters}
        />

        <AdvancedFilterModal
          open={showAdvanced}
          onClose={() => setShowAdvanced(false)}
          onApply={handleApplyAdvanced}
          initialRules={advancedRules}
        />
      </div>

      {showQuickFilter && (
        <div className="fixed inset-0 z-40" onClick={() => setShowQuickFilter(false)} />
      )}

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
