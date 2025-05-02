import React from 'react';

interface SearchFilterProps {
  onSearch: (category: string) => void;
  isLoading: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, isLoading }) => {
  const handleSearch = (category: string) => {
    if (!isLoading) {
      onSearch(category);
    }
  };

  return (
    <div className="p-4 bg-gray-100 flex justify-center space-x-4">
      <button
        onClick={() => handleSearch('golf')}
        disabled={isLoading}
        className={`px-4 py-2 rounded font-semibold ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
      >
        Viral Golf Videos
      </button>
      <button
        onClick={() => handleSearch('goals')}
        disabled={isLoading}
        className={`px-4 py-2 rounded font-semibold ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700 text-white'}`}
      >
        Viral Goals (Soccer, NHL, etc.)
      </button>
      {/* Optional: Add platform filters or sorting later */}
    </div>
  );
};

export default SearchFilter;

