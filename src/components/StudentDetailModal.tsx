import { X, User, Mail, Phone, Calendar, GraduationCap, Clock, Activity } from 'lucide-react';
import AttendanceHistory from "./AttendanceHistory";

const StudentDetailModal = ({ isOpen, onClose, student }: {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}) => {
  const attendanceFromStudent = Array.isArray(student?.attendanceTimes)
    ? student.attendanceTimes.map((t: string) => ({
        createdAt: t,
        user: { email: student?.email }
      }))
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl animate-fadeIn max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chi tiết học sinh</h2>
                <p className="text-blue-100">Thông tin và lịch sử điểm danh</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          {student && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || "S")}&background=random&size=120`}
                        alt="avatar"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 text-gray-900">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2">{student.name}</h3>
                      <p className="text-gray-600 text-lg mb-1">{student.email}</p>
                      {student.phone && (
                        <p className="text-gray-500 text-sm">{student.phone}</p>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Học sinh</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Student Info Cards */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mã học sinh</p>
                        <p className="font-semibold text-gray-900">{student.studentId || student.id || student._id} </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl w-min">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div >
                        <p className="text-sm text-gray-600 ">Email</p>
                        <p className="font-semibold text-gray-900 truncate">{student.email}</p>
                      </div>
                    </div>
                    
                    {student.phone && (
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{student.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.dateOfBirth && (
                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ngày sinh</p>
                          <p className="font-semibold text-gray-900">{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{student.attendanceCount ?? 0}</p>
                      <p className="text-sm text-gray-600">Lần điểm danh</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{student.attendanceRate ?? 0}%</p>
                      <p className="text-sm text-gray-600">Tỷ lệ điểm danh</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance History */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Lịch sử điểm danh
                  </h2>
                  <p className="text-gray-600 mt-1">Chi tiết các lần điểm danh của học sinh</p>
                </div>
                <div className="p-6">
                  <AttendanceHistory attendance={attendanceFromStudent as any} title="" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;  