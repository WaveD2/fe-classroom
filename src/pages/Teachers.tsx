import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ROLE, PaginationInfo } from "../types";
import { getTeachers } from "../api/user";
import PaginationBar from "../components/common/PaginationBar";
import SearchBar from "../components/common/Search";
import { ListSkeleton, StatsSkeleton } from "../components/loading/LoadingSkeleton";
import { 
  Users, 
  Mail, 
  GraduationCap, 
  ArrowRight,
  Calendar,
  Grid,
  List,
  Plus
} from "lucide-react";

export default function TeachersPage({ userRole }: { userRole: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        const res = await getTeachers({ search: currentSearch || undefined, page, limit: pagination.limit });
        if (res?.data) {
          setTeachers(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } finally {
        setLoading(false);
      }
    };
  }, [pagination.page, pagination.limit, search]);

    useEffect(() => {
        fetchData(1, search);
    }, [search, fetchData]);

    useEffect(() => {
      fetchData();
    }, [pagination.page, fetchData]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination.totalPages && page > pagination.totalPages)) return;
    setPagination((p) => ({ ...p, page }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <SearchBar
                 value={search}
                 onChange={(v) => setSearch(v)}
                 placeholder="Tìm kiếm giáo viên theo tên hoặc email..."
                 delay={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-purple-100 text-purple-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Xem dạng lưới"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-purple-100 text-purple-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Xem dạng danh sách"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                // onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Thêm giáo viên
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                  <p className="text-sm text-gray-600">Tổng giáo viên</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Grid */}
        {loading ? (
          <ListSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachers.map((teacher, index) => (
              <div
                key={teacher.id || teacher._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200"
                onClick={() => navigate(`/teacher/${teacher.id || teacher._id}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{teacher.name}</h3>
                      <p className="text-blue-100 text-sm">Giáo viên</p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">ID: {teacher.id || teacher._id}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Xem chi tiết</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!teachers.length && (
              <div className="col-span-full">
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giáo viên</h3>
                  <p className="text-gray-500">
                    {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có giáo viên nào trong hệ thống'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
          <div className="mt-8">
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onChangePage={handlePageChange}
              onChangeLimit={(limit) => setPagination((p) => ({ ...p, page: 1, limit }))}
            />
          </div>
      </div>
    </div>
  );
}


