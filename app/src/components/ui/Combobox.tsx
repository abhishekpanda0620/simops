import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(o => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 bg-surface-700 hover:bg-surface-600 rounded-md transition-colors text-sm font-medium text-surface-200 border border-transparent focus:border-primary-500/50 outline-none",
          disabled && "opacity-50 cursor-not-allowed hover:bg-surface-700",
          isOpen && "border-primary-500/50"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 shrink-0 text-surface-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[240px] bg-surface-800 border border-surface-700 rounded-md shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-surface-700 relative">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              placeholder={searchPlaceholder}
              className="w-full bg-surface-900 border-none rounded text-sm py-1.5 pl-8 pr-2 focus:ring-1 focus:ring-primary-500 text-surface-200 placeholder:text-surface-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between group",
                    value === option.value
                      ? "bg-surface-700 text-primary-400"
                      : "text-surface-200 hover:bg-surface-700"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-surface-500">
                No results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
