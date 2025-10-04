import { useState } from 'react';
import { X, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import { StudentWithAttendance, ManualAttendanceData, ManualAttendanceRequest } from '../types';
import { manualAttendanceTeacher, manualAttendanceAdmin } from '../api/class';
import { ROLE } from '../types';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  students: StudentWithAttendance[];
  userRole: string;
  onSuccess?: () => void;
}

const ManualAttendanceModal = ({
  isOpen,
  onClose,
  classId,
  students,
  userRole,
  onSuccess
}: ManualAttendanceModalProps) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [attendanceTime, setAttendanceTime] = useState<string>(() => {
    const now = new Date();
    return now.toISOString()
  });
  const [attendanceType, setAttendanceType] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student._id || student.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      setError('Vui lòng chọn ít nhất một học sinh');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const attendanceData: ManualAttendanceData[] = selectedStudents.map(studentId => ({
        studentId,
        timeAttendance: new Date(attendanceTime).toISOString(),
        type: attendanceType,
      }));

      const requestData: ManualAttendanceRequest = { attendanceData };

      // Choose API based on user role
      if (userRole === ROLE.TEACHER) {
        await manualAttendanceTeacher(classId, requestData);
      } else if (userRole === ROLE.ADMIN) {
        await manualAttendanceAdmin(classId, requestData);
      }

      // Reset form
      setSelectedStudents([]);
      setAttendanceTime(() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      });
      setAttendanceType('active');
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi điểm danh');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Điểm danh thủ công</h2>
                <p className="text-blue-100 text-sm">Chọn học sinh và thời gian điểm danh</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Settings */}
            <div className="space-y-6">
              {/* Time Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Thời gian điểm danh
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian
                    </label>
                    <input
                      type="datetime-local"
                      value={attendanceTime}
                      onChange={(e) => setAttendanceTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại điểm danh
                    </label>
                    <select
                      value={attendanceType}
                      onChange={(e) => setAttendanceType(e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="active">Có mặt</option>
                      <option value="inactive">Vắng mặt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Tóm tắt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Số học sinh đã chọn:</span>
                    <span className="font-medium text-blue-900">{selectedStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tổng học sinh:</span>
                    <span className="font-medium text-blue-900">{students.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Thời gian:</span>
                    <span className="font-medium text-blue-900">
                      {new Date(attendanceTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Student List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách học sinh</h3>
                <Button
                  onClick={handleSelectAll}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  {selectedStudents.length === students.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(student._id || student.id);
                  return (
                    <div
                      key={student._id || student.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStudentToggle(student._id || student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{student.name}</p>
                          <p className="text-sm text-gray-500 truncate">{student.email}</p>
                          
                          {/* Attendance Stats */}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{student.attendanceCount} lần điểm danh</span>
                            <span>{student.attendanceRate}% tỷ lệ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedStudents.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Đang xử lý...' : `Điểm danh ${selectedStudents.length} học sinh`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;
