import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserType, ROLE, PaginationInfo } from "../types";
import { getStudents } from "../api/user";
import PaginationBar from "../components/PaginationBar";
import SearchBar from "../components/Search";
import { ListSkeleton, StatsSkeleton } from "../components/LoadingSkeleton";
import { 
  Users, 
  Mail, 
  User, 
  ArrowRight,
  Calendar,
  GraduationCap,
} from "lucide-react";

export default function StudentsPage({ userRole }: { userRole: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<UserType[]>([]);
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
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination.totalPages && page > pagination.totalPages)) return;
    setPagination((p) => ({ ...p, page }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Danh sách học sinh
          </h1>
        </div>
        <p className="text-gray-600">Quản lý và xem thông tin chi tiết của các học sinh</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Tìm kiếm học sinh theo tên hoặc email..."
          delay={500}
        />
      </div>

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Grid */}
      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student, index) => (
            <div
              key={student.id || student._id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200"
              onClick={() => navigate(`/student/${student.id || student._id}`)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{student.name}</h3>
                    <p className="text-green-100 text-sm">Học sinh</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600 truncate">{student.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">ID: {student.id || student._id}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Xem chi tiết</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {!students.length && (
            <div className="col-span-full">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy học sinh</h3>
                <p className="text-gray-500">
                  {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có học sinh nào trong hệ thống'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChangePage={handlePageChange}
            onChangeLimit={(limit) => {
              console.log("limit:", limit);
              setPagination((p) => ({ ...p, page: 1, limit }))
            }}
          />
        </div>
      )}
    </div>
  );
}


