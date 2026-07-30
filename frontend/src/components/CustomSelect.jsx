import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function normalizeOptions(options) {
  return options.map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? { value: opt, label: String(opt) }
      : opt,
  );
}

export default function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const items = normalizeOptions(options);
  const selected = items.find((item) => item.value === value);
  const selectedIdx = selected ? items.indexOf(selected) : -1;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setFocusedIdx(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setFocusedIdx(-1);
    }
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && focusedIdx >= 0) {
      const el = listRef.current.children[focusedIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx, open]);

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIdx >= 0 && focusedIdx < items.length) {
          onChange(items[focusedIdx].value);
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  function handleSelect(item) {
    onChange(item.value);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input-field bg-white text-left flex items-center justify-between gap-2 cursor-pointer ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 left-0 right-0 rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto"
        >
          {items.map((item, idx) => (
            <button
              key={String(item.value)}
              type="button"
              role="option"
              aria-selected={item.value === value}
              onMouseEnter={() => setFocusedIdx(idx)}
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                item.value === value
                  ? 'bg-brand-100 text-brand-900 font-medium'
                  : focusedIdx === idx
                    ? 'bg-brand-50 text-gray-900'
                    : 'text-gray-900 hover:bg-brand-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
