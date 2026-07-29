import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  emoji?: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  error?: string;
  disabled?: boolean;
}

/**
 * Custom Searchable Select Dropdown Component
 * Designed to look exactly like the project's standard Inputs and Select elements.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'Select...',
  value,
  onChange,
  options,
  error,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="w-full space-y-1.5 relative">
      {label && <span className="block text-sm font-medium text-neutral-600">{label}</span>}

      {/* Dropdown Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch('');
          }
        }}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.emoji && <span className="shrink-0">{selectedOption.emoji}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white p-1 shadow-lg transform origin-top-right transition-all">
          {/* Search Input */}
          <div className="sticky top-0 bg-white p-1 border-b border-neutral-100 flex items-center gap-2">
            <Search className="h-4 w-4 text-neutral-400 shrink-0 ml-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent py-1 text-sm text-neutral-800 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 ${
                    opt.value === value
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                  }`}
                >
                  {opt.emoji && <span className="shrink-0">{opt.emoji}</span>}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-neutral-400 text-center">No results found</div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
