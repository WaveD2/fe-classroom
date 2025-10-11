import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  Calendar,
  UserCheck,
  UserX,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-react';
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
    return now.toISOString().slice(0, 16);
  });
  const [attendanceType, setAttendanceType] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'attendanceRate' | 'attendanceCount'>('name');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'attendanceRate':
          return (b.attendanceRate || 0) - (a.attendanceRate || 0);
        case 'attendanceCount':
          return (b.attendanceCount || 0) - (a.attendanceCount || 0);
        default:
          return 0;
      }
    });
  }, [students, searchTerm, sortBy]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student._id || student.id));
    }
  };

  const handleSelectByType = (type: 'active' | 'inactive') => {
    const studentsToSelect = filteredStudents.filter(student => {
      if (type === 'active') {
        return (student.attendanceRate || 0) >= 80;
      } else {
        return (student.attendanceRate || 0) < 80;
      }
    });
    
    const studentIds = studentsToSelect.map(student => student._id || student.id);
    setSelectedStudents(prev => [...new Set([...prev, ...studentIds])]);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStudents([]);
      setError('');
      setSearchTerm('');
      setIsExpanded(false);
      setShowFilters(false);
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      {/* Mobile: Full screen */}
      <div className="w-full h-full md:w-1/2 lg:w-1/2 xl:w-1/2 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Điểm danh thủ công</h2>
                <p className="text-blue-100 text-sm">Quản lý điểm danh học sinh</p>
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
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSelectAll}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                {selectedStudents.length === filteredStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
              <Button
                onClick={() => handleSelectByType('active')}
                variant="secondary"
                size="sm"
                className="text-xs text-green-600 hover:text-green-700"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Chọn học sinh tích cực
              </Button>
              <Button
                onClick={() => handleSelectByType('inactive')}
                variant="secondary"
                size="sm"
                className="text-xs text-orange-600 hover:text-orange-700"
              >
                <UserX className="w-3 h-3 mr-1" />
                Chọn học sinh vắng nhiều
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b bg-white">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2.5 border rounded-lg transition-all ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-600' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="name">Sắp xếp theo tên</option>
                    <option value="attendanceRate">Sắp xếp theo tỷ lệ điểm danh</option>
                    <option value="attendanceCount">Sắp xếp theo số lần điểm danh</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Cài đặt điểm danh</span>
              </div>
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian điểm danh
                    </label>
                    <input
                      type="datetime-local"
                      value={attendanceTime}
                      onChange={(e) => setAttendanceTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại điểm danh
                    </label>
                    <select
                      value={attendanceType}
                      onChange={(e) => setAttendanceType(e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="active">Có mặt</option>
                      <option value="inactive">Vắng mặt</option>
                    </select>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium">Đã chọn</div>
                    <div className="text-lg font-bold text-blue-900">{selectedStudents.length}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium">Tổng số</div>
                    <div className="text-lg font-bold text-blue-900">{filteredStudents.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              {filteredStudents.map((student, index) => {
                const isSelected = selectedStudents.includes(student._id || student.id);
                const attendanceRate = student.attendanceRate || 0;
                
                return (
                  <div
                    key={student._id || student.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleStudentToggle(student._id || student.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendanceRate >= 80 
                              ? 'bg-green-100 text-green-700' 
                              : attendanceRate >= 60 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {attendanceRate}%
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{student.email}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {student.attendanceCount || 0} lần
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {attendanceRate >= 80 ? 'Tích cực' : attendanceRate >= 60 ? 'Trung bình' : 'Cần cải thiện'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Không tìm thấy học sinh nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            Đã chọn <span className="font-semibold text-blue-600">{selectedStudents.length}</span> học sinh
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedStudents.length === 0}
              className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                `Điểm danh ${selectedStudents.length} học sinh`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;
