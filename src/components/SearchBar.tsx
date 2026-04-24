import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  isProcessing: boolean;
}

export default function SearchBar({ onSearch, isProcessing }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isProcessing}
          placeholder="Ask a clinical question... (e.g. safe positioning after rotator cuff repair)"
          className="w-full pl-12 pr-24 py-4 rounded-full border-2 border-gray-200 focus:border-teal-500 focus:ring-0 outline-none text-lg shadow-sm transition-all bg-white"
        />
        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </form>
  );
}
