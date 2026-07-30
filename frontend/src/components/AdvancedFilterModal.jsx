import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import CustomSelect from './CustomSelect';

const CONDITIONS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not equals' },
  { value: 'icontains', label: 'Contains' },
  { value: 'gte', label: 'Greater or equal' },
  { value: 'lte', label: 'Less or equal' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
];

const FIELD_META = {
  status: { label: 'Status', type: 'choice' },
  date: { label: 'Date', type: 'date' },
  time: { label: 'Time', type: 'time' },
  party_size: { label: 'Party size', type: 'number' },
  notes: { label: 'Notes', type: 'text' },
};

function emptyRule() {
  return { field: 'status', condition: 'eq', value: '', logic: 'and' };
}

export default function AdvancedFilterModal({
  open,
  onClose,
  onApply,
  initialRules = [],
}) {
  const initialRulesRef = useRef(initialRules);
  initialRulesRef.current = initialRules;

  const [rules, setRules] = useState([]);
  const [logic, setLogic] = useState('and');

  useEffect(() => {
    if (open) {
      const saved = initialRulesRef.current;
      setRules(saved.length > 0 ? saved.map((r) => ({ ...r })) : [emptyRule()]);
      setLogic(saved.length > 0 ? saved[0]?.logic || 'and' : 'and');
    }
  }, [open]);

  function updateRule(idx, patch) {
    setRules((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  }

  function removeRule(idx) {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      { ...emptyRule(), logic: prev.length > 0 ? logic : 'and' },
    ]);
  }

  function handleApply() {
    const valid = rules.filter((r) => r.value !== '');
    if (valid.length === 0) return;
    const withLogic = valid.map((r, i) =>
      i === 0 ? { ...r, logic: 'and' } : { ...r, logic },
    );
    onApply(withLogic);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl mx-4 rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Advance Filter</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 max-h-96 min-h-[280px] overflow-y-auto space-y-3">
          {rules.length > 1 && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs font-medium text-gray-500">Match</span>
              <button
                type="button"
                onClick={() => setLogic((v) => (v === 'and' ? 'or' : 'and'))}
                className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                  logic === 'and'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {logic}
              </button>
              <span className="text-xs text-gray-500">all rules</span>
            </div>
          )}

          {rules.map((rule, idx) => {
            const meta = FIELD_META[rule.field] || FIELD_META.status;
            return (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && (
                  <span className="text-xs font-semibold uppercase text-gray-400 w-8 shrink-0">
                    {logic}
                  </span>
                )}
                {idx === 0 && <div className="w-8 shrink-0" />}

                <div className="w-36">
                  <CustomSelect
                    value={rule.field}
                    onChange={(v) =>
                      updateRule(idx, { field: v, condition: 'eq', value: '' })
                    }
                    options={Object.entries(FIELD_META).map(([k, v]) => ({
                      value: k,
                      label: v.label,
                    }))}
                  />
                </div>

                <div className="w-40">
                  <CustomSelect
                    value={rule.condition}
                    onChange={(v) => updateRule(idx, { condition: v })}
                    options={CONDITIONS.filter((c) => {
                      if (meta.type === 'choice' && c.value === 'icontains')
                        return false;
                      if (meta.type === 'text' && c.value === 'icontains')
                        return true;
                      if (meta.type === 'date' && c.value === 'icontains')
                        return false;
                      if (meta.type === 'time' && c.value === 'icontains')
                        return false;
                      return true;
                    })}
                  />
                </div>

                {meta.type === 'choice' ? (
                  <div className="flex-1">
                    <CustomSelect
                      value={rule.value}
                      onChange={(v) => updateRule(idx, { value: v })}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'confirmed', label: 'Confirmed' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                      placeholder="Select..."
                    />
                  </div>
                ) : (
                  <input
                    type={meta.type}
                    value={rule.value}
                    onChange={(e) => updateRule(idx, { value: e.target.value })}
                    placeholder="Value"
                    className="input-field flex-1"
                  />
                )}

                {rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(idx)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addRule}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus size={16} />
            Add Filter
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost border border-gray-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!rules.some((r) => r.value !== '')}
            className="btn-primary"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
