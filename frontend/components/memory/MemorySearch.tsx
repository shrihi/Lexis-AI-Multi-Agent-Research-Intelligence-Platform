'use client';

import { useState, useCallback } from 'react';

type MemorySearchProps = {
  onSearch: (query: string) => void;
};

const debounce = (fn: (...args: unknown[]) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => { fn(...args); }, delay);
  };
};

export default function MemorySearch({ onSearch }: MemorySearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(
    debounce((q: unknown) => {
      const searchQuery = String(q);
      if (searchQuery.trim()) {
        setIsSearching(true);
        onSearch(searchQuery);
      } else {
        setIsSearching(false);
      }
    }, 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    search(value);
  };

  return (
    <div className="max-w-sm mx-auto mb-8">
      <div className="relative w-full bg-surface rounded-lg border border-border p-4">
        <input
          type="text"
          placeholder="Search past research..."
          value={query}
          onChange={handleChange}
          className="w-full bg-transparent text-text focus:outline-none focus:text-accent-blue"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
