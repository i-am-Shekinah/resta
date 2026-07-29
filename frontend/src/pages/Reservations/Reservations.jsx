import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [time, setTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: availability, refetch: checkAvailability } = useQuery({
    queryKey: ['availability', date, partySize],
    queryFn: () => client.get('/reservations/availability/', { params: { date, party_size: partySize } }).then((r) => r.data),
    enabled: false,
  });

  async function handleCheckAvailability(e) {
    e.preventDefault();
    if (!date) return;
    checkAvailability();
  }

  async function handleReserve() {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }
    setLoading(true);
    try {
      await client.post('/reservations/', {
        table: selectedTable,
        date,
        time,
        party_size: partySize,
        notes,
      });
      toast.success('Reservation created!');
      setSelectedTable(null);
      setDate('');
    } catch (err) {
      toast.error(err.response?.data?.error?.[0] || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="page-heading mb-8">Reserve a Table</h1>

      <div className="card-restaurant p-6 mb-6">
        <form onSubmit={handleCheckAvailability} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
            <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="input-field">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">Check Availability</button>
        </form>
      </div>

      {availability && (
        <div className="card-restaurant p-6 mb-6">
          <h2 className="section-title mb-4">
            Available Tables — {availability.date} ({availability.party_size} guests)
          </h2>
          {availability.available_tables.length === 0 ? (
            <p className="text-gray-500">No tables available for this date and party size.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {availability.available_tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedTable === table.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <p className="font-medium">Table {table.number}</p>
                  <p className="text-sm text-gray-500">{table.capacity} seats — {table.location}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTable && (
        <div className="card-restaurant p-6">
          <h2 className="section-title mb-4">Complete Reservation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Any special requests..."
              />
            </div>
            <button onClick={handleReserve} disabled={loading} className="btn-primary w-full">
              {loading ? 'Reserving...' : 'Confirm Reservation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
