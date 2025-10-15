import { memo } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Clock, 
  TrendingUp
} from 'lucide-react';
import { StudentWithAttendance } from '../../types';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithAttendance | null;
}

const StudentDetailModal = memo(({ isOpen, onClose, student }: StudentDetailModalProps) => {
  if (!isOpen || !student) return null;

  const attendanceRate = student.attendanceRate || 0;
  const attendanceCount = student.attendanceCount || 0;

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-blue-100 text-sm">Thông tin học sinh</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-semibold text-gray-900">{student.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{student.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê điểm danh</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-blue-900">{attendanceCount}</p>
                  <p className="text-sm text-blue-600">Lần điểm danh</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-900">{attendanceRate}%</p>
                  <p className="text-sm text-green-600">Tỷ lệ tham gia</p>
                </div>
              </div>

              <div className="mt-4 bg-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tiến độ điểm danh</span>
                  <span className="font-bold text-blue-600">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      attendanceRate >= 80 ? 'bg-green-500' : 
                      attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
});

StudentDetailModal.displayName = 'StudentDetailModal';

export default StudentDetailModal;