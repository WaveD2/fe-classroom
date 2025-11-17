import {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../types";
import { deleteUser, getTeacherById } from "../api/user";
import LazyLoad from "../components/loading/LazyLoad";
import { 
  ArrowLeft, 
  GraduationCap, 
  Mail, 
  Calendar, 
  Users, 
  BookOpen, 
  BarChart3,
  Clock,
  UserCheck,
  Edit,
  DeleteIcon
} from "lucide-react";
import ProfileModal from "../components/user/ProfileModal";
import { updateUser } from "../api/auth";
import ConfirmModal from "../components/common/ConfirmModal";

export default function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getTeacherById(id as string);
        if (mounted && res?.data) {
          setUser(res.data as unknown as User);
          setClasses((res.data as any).classes || []);
          setSummary((res.data as any).summary || null);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
    return () => { mounted = false; };
  }, [id]);
  
  const handleUpdateProfile = async (userData: Partial<User>) => {
    const response = await updateUser(String(id), userData);
    if (response?.data) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(response.data.data)
    }
    return response;
  };

  const handleDelete = (async () => {
    if (user?.name) {
      const data =await deleteUser(user._id || user.id);
      setShowDeleteModal(false);
      if(data.status === 200) navigate("/teacher");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 text-gray-700 hover:text-blue-600 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="space-x-2">
          <button
            onClick={() => setShowProfileModal(true) }
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-xl shadow-sm cursor-pointer border border-gray-200 hover:shadow-md hover:border-blue-300 text-gray-700 hover:text-blue-600 transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>
          <button
            onClick={() =>  setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-400 rounded-xl shadow-sm border cursor-pointer border-gray-200 hover:shadow-md text-gray-100 transition-all duration-200"
          >
            <DeleteIcon className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LazyLoad delay={500}>
          <div></div>
        </LazyLoad>
      ) : user ? (
        <LazyLoad delay={300}>
          <div className="space-y-8">
          {/* Teacher Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user.name}</h1>
                  <p className="text-blue-100 text-lg">Giáo viên</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-200">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      ID: {user.id || (user as any)._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{summary.totalClasses}</p>
                    <p className="text-sm text-gray-600">Tổng số lớp</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{summary.totalStudents}</p>
                    <p className="text-sm text-gray-600">Tổng số học sinh</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
                    <p className="text-sm text-gray-600">Lớp đang dạy</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Lớp phụ trách</h2>
              </div>
            </div>
            
            <div className="p-6">
              {classes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-gray-200">
                        <th className="pb-3 font-medium">Tên lớp</th>
                        <th className="pb-3 font-medium">Số học sinh</th>
                        <th className="pb-3 font-medium">Số buổi học</th>
                        <th className="pb-3 font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {classes.map((c, index) => (
                        <tr key={c.classId} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                              </div>
                              <span className="font-medium text-gray-900">{c.className}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{c.studentCount}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{c.sessions}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Đang hoạt động
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp nào</h3>
                  <p className="text-gray-500">Giáo viên này chưa được phân công lớp nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </LazyLoad>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giáo viên</h3>
          <p className="text-gray-500">Thông tin giáo viên không tồn tại hoặc đã bị xóa</p>
        </div>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user as User}
        onUpdateProfile={handleUpdateProfile}
      />

      <ConfirmModal
        open={showDeleteModal}
        type="warning"
        title="Xác nhận xóa giáo viên"
        message={`Bạn có chắc chắn muốn xóa giáo viên"${user?.name}" không? Các lớp của giáo viên tham gia sẽ trống giáo viên. Hành động này không thể hoàn tác.`}
        onClose={()=> setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}



