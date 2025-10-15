import Pagination from "./Pagination";

export default function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onChangePage,
  onChangeLimit,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-3 border-t border-gray-100 pt-4">
      {/* Left side: info + select */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="hidden sm:inline">
          Tổng <strong className="text-gray-800">{total}</strong> mục
        </span>
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded-lg px-3 py-1.5 pr-7 text-gray-700 bg-white shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            value={limit}
            onChange={(e) => onChangeLimit(Number(e.target.value))}
          >
            {[10, 20, 50].map((l) => (
              <option key={l} value={l}>
                {l}/trang
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ▼
          </span>
        </div>
      </div>

      {/* Right side: pagination */}
      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={onChangePage}
        />
      </div>
    </div>
  );
}
