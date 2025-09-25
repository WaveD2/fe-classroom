import Pagination from "./Pagination";

export default function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onChangePage,
  onChangeLimit
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex justify-self-end text-sm text-gray-600 mb-2">
        <select
          className="border rounded-lg px-2 py-1 "
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value))}
        >
          {[10, 20, 50].map((l) => (
            <option key={l} value={l}>{l}/trang</option>
          ))}
        </select>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={onChangePage}
      />
    </div>
  );
}


