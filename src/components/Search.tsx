import { Search } from "lucide-react";

const SearchBar = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="relative w-full">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size={20}
    />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base
                 outline-none" 
    />
  </div>
);

export default SearchBar;
