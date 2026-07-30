import { Search, Filter, SlidersHorizontal, ArrowUp, ArrowDown, X } from 'lucide-react';

export default function FilterBar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortDir = 'desc',
  onSortDirChange,
  quickFilterActive = false,
  onQuickFilterToggle,
  advancedActive = false,
  onAdvancedToggle,
  onClearAdvanced,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field pl-10"
        />
      </div>

      <button
        type="button"
        onClick={onQuickFilterToggle}
        className={`btn-ghost border px-3 py-3 ${quickFilterActive ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-300 text-gray-600'}`}
        aria-label="Quick filters"
      >
        <Filter size={18} />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={onAdvancedToggle}
          className={`btn-ghost border px-3 py-3 ${advancedActive ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-300 text-gray-600'}`}
          aria-label="Advanced filters"
        >
          <SlidersHorizontal size={18} />
        </button>
        {advancedActive && onClearAdvanced && (
          <button
            type="button"
            onClick={onClearAdvanced}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-600"
            aria-label="Clear advanced filters"
          >
            <X size={10} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')}
        className="btn-ghost border border-gray-300 px-3 py-3 text-gray-600"
        aria-label={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
      >
        {sortDir === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
      </button>
    </div>
  );
}
