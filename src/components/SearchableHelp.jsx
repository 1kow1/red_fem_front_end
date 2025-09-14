import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchableHelp({ onSearch, searchTerm, onClear }) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar na ajuda..."
          value={localSearchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {localSearchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          Buscando por: "<span className="font-medium">{localSearchTerm}</span>"
        </div>
      )}
    </div>
  );
}