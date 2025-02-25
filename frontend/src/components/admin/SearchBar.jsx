
const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Rechercher..."
      className="w-full px-4 py-2 transition-colors border-2 rounded-xl border-amber-100 focus:border-teal-400 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
    />
    <button className="absolute -translate-y-1/2 right-3 top-1/2">
      <svg
        className="w-5 h-5 text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  </div>
);

export default SearchBar;