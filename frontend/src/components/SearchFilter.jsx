import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function SearchFilter({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  sortField = '',
  onSortFieldChange,
  sortFields = [],
  sortDir = 'desc',
  onSortDirChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="relative flex-1 w-full sm:max-w-xs">
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

      {filters.map((filter) => (
        <div key={filter.label} className="w-full sm:w-auto">
          {filter.type === 'range' ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">{filter.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type={filter.subType}
                  value={filter.from}
                  onChange={(e) => filter.onFromChange(e.target.value)}
                  className="input-field"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type={filter.subType}
                  value={filter.to}
                  onChange={(e) => filter.onToChange(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          ) : (
            <CustomSelect
              value={filter.value}
              onChange={filter.onChange}
              options={filter.options}
            />
          )}
        </div>
      ))}

      {sortFields.length > 0 && (
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <CustomSelect
              value={sortField}
              onChange={onSortFieldChange}
              options={sortFields}
              placeholder="Sort by"
            />
          </div>

          <button
            type="button"
            onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')}
            className="btn-ghost border border-gray-300 px-3"
            aria-label={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDir === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
