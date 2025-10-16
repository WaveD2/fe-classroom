import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, GraduationCap, BookOpen, TrendingUp, Clock, Award, Activity, Edit, DeleteIcon } from "lucide-react";
import { User as UserType } from "../types";
import { deleteUser, getStudentById } from "../api/user";
import ProfileModal from "../components/user/ProfileModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { updateProfile } from "../api/auth";

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
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
        const res = await getStudentById(id as string);
        if (mounted && res?.data) {
          setUser(res.data as unknown as UserType);
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

   const handleUpdateProfile = async (userData: Partial<UserType>) => {
      const response = await updateProfile(userData);
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
        await deleteUser(user._id || user.id);
        setShowDeleteModal(false);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
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

      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Đang tải thông tin học sinh...</p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <img
                      src={ user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=120`}
                      alt="avatar"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-white">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.name}</h1>
                    <p className="text-blue-100 text-lg mb-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-blue-200 text-sm">{user.phone}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-sm font-medium">Học sinh</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Student Info */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mã học sinh</p>
                      <p className="font-semibold text-gray-900">{user.studentId || user.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày sinh</p>
                        <p className="font-semibold text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{summary.totalClasses}</p>
                      <p className="text-sm text-gray-600">Lớp học</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Tổng số lớp tham gia</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{summary.averagePercent}%</p>
                      <p className="text-sm text-gray-600">Điểm danh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Tỷ lệ trung bình</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {classes.reduce((sum, c) => sum + c.attended, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Buổi có mặt</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">Tổng số buổi tham gia</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {classes.reduce((sum, c) => sum + c.total, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Tổng buổi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">Tổng số buổi học</span>
                  </div>
                </div>
              </div>
            )}

            {/* Classes Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Lớp học đã tham gia
                </h2>
                <p className="text-gray-600 mt-1">Chi tiết điểm danh của học sinh trong các lớp</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tên lớp
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Có mặt
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tổng buổi
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tỷ lệ
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((c, index) => {
                      const percentage = c.percent || 0;
                      const getStatusColor = (percent: number) => {
                        if (percent >= 80) return 'bg-green-100 text-green-800';
                        if (percent >= 60) return 'bg-yellow-100 text-yellow-800';
                        return 'bg-red-100 text-red-800';
                      };
                      
                      const getStatusText = (percent: number) => {
                        if (percent >= 80) return 'Tốt';
                        if (percent >= 60) return 'Khá';
                        return 'Cần cải thiện';
                      };

                      return (
                        <tr key={c.classId || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{c.className}</div>
                                <div className="text-xs text-gray-500">Lớp học</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-gray-900">{c.attended}</div>
                            <div className="text-xs text-gray-500">buổi</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-gray-900">{c.total}</div>
                            <div className="text-xs text-gray-500">buổi</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(percentage)}`}>
                              {getStatusText(percentage)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {classes.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa tham gia lớp nào</h3>
                  <p className="text-gray-600">Học sinh chưa được thêm vào lớp học nào</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy học sinh</h3>
            <p className="text-gray-600">Học sinh không tồn tại hoặc đã bị xóa</p>
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user as UserType}
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



