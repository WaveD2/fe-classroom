import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  delay = 500,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  delay?: number;
}) => {
  const [inner, setInner] = useState(value || "");
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    setInner(value || "");
  }, [value]);

  useEffect(() => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => onChange(inner.trim()), delay);
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [inner, delay, onChange]);

  return (
  <div className="relative w-full">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size={20}
    />
    <input
      type="text"
      placeholder={placeholder}
      value={inner}
      onChange={(e) => setInner(e.target.value)}
      className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base
                 outline-none" 
    />
  </div>
)};

export default SearchBar;
