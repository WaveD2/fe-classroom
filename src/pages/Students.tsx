import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ROLE, PaginationInfo } from "../types";
import { getStudents } from "../api/user";
import PaginationBar from "../components/PaginationBar";
import SearchBar from "../components/Search";

export default function StudentsPage({ userRole }: { userRole: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    if (userRole !== ROLE.ADMIN) {
      navigate("/", { replace: true });
      return;
    }
  }, [userRole, navigate]);

  const fetchData = useMemo(() => {
    return async (page = pagination.page, currentSearch = search) => {
      setLoading(true);
      try {
        const res = await getStudents({ search: currentSearch || undefined, page, limit: pagination.limit });
        if (res?.data) {
          setStudents(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } finally {
        setLoading(false);
      }
    };
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
      fetchData(1, search);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination.totalPages && page > pagination.totalPages)) return;
    setPagination((p) => ({ ...p, page }));
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Danh sách học sinh</h1>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar
             value={search}
             onChange={(v) => setSearch(v)}
             placeholder="Tìm kiếm theo tên hoặc email..."
             delay={500}
          />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((u) => (
            <button
              key={u.id || u._id}
              onClick={() => navigate(`/student/${u.id || u._id}`)}
              className="group text-left bg-white rounded-xl border hover:shadow-md transition p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${u.name?.replace(" ", "+")}&background=random`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.name}</p>
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                </div>
              </div>
            </button>
          ))}
          {!students.length && (
            <div className="col-span-full text-center text-gray-500">Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onChangePage={handlePageChange}
          onChangeLimit={(limit) => setPagination((p) => ({ ...p, page: pagination.page, limit }))}
        />
      )}
    </div>
  );
}


