import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function QuickFilterPopover({
  open,
  onClose,
  sections = [],
  onReset,
}) {
  const panelRef = useRef(null);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute z-50 mt-2 left-0 w-72 rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Quick Filters</span>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Reset
        </button>
      </div>

      <div className="py-2">
        {sections.map((section) => {
          const isOpen = collapsed[section.id] !== false;
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [section.id]: prev[section.id] === false ? true : false,
                  }))
                }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {section.label}
              </button>
              {isOpen && (
                <div className="px-4 pb-2 space-y-1">
                  {section.options.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={opt.checked}
                        onChange={(e) => {
                          if (opt.single && opt.checked) return;
                          section.onChange(opt.value, e.target.checked);
                        }}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
