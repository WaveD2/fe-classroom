import { memo, useState, useMemo } from 'react';
import { 
  Eye, 
  Clock, 
  TrendingUp, 
  User, 
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ROLE, StudentWithAttendance } from "../../types";
import StudentDetailModal from "./StudentDetailModal";

interface StudentListProps {
  students: StudentWithAttendance[];
  onStudentClick?: (student: StudentWithAttendance) => void;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
}

const StudentList = memo(({ 
  students, 
  onStudentClick, 
  showActions = false,
  showSearch = true,
  showFilters = true
}: StudentListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'attendanceRate' | 'attendanceCount'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortOptions, setShowSortOptions] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    const filtered = students.filter(student => 
      student.role === ROLE.STUDENT &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.email.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleStudentClick = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    onStudentClick?.(student);
  };

  const getAttendanceStatusColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAttendanceStatusText = (rate: number) => {
    if (rate >= 80) return 'Tốt';
    if (rate >= 60) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
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
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {/* Sort */}
              {showFilters && (
                <div className="relative">
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Sắp xếp</span>
                    {showSortOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showSortOptions && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-in slide-in-from-top-2 duration-200">
                      <div className="p-2">
                        <button
                          onClick={() => { setSortBy('name'); setShowSortOptions(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === 'name' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                          }`}
                        >
                          Theo tên
                        </button>
                        <button
                          onClick={() => { setSortBy('attendanceRate'); setShowSortOptions(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === 'attendanceRate' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                          }`}
                        >
                          Theo tỷ lệ điểm danh
                        </button>
                        <button
                          onClick={() => { setSortBy('attendanceCount'); setShowSortOptions(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === 'attendanceCount' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                          }`}
                        >
                          Theo số lần điểm danh
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => (
            <div 
              key={student._id || student.id} 
              className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white rounded-xl border border-gray-200"
              onClick={() => handleStudentClick(student)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-center">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-xl font-bold text-white">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{student.name}</h3>
                
                {/* Email */}
                <p className="text-sm text-gray-500 mb-3 truncate">{student.email}</p>
                
                {/* Attendance Stats */}
                <div className="space-y-2">
                  <div className='flex items-center justify-center gap-x-2'>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{student.attendanceCount || 0} lần</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-3 h-3 text-gray-500" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(student.attendanceRate || 0)}`}>
                        {student.attendanceRate || 0}%
                      </span>
                    </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {getAttendanceStatusText(student.attendanceRate || 0)}
                    </div>
                </div>

                {/* Action Button */}
                {showActions && (
                  <div className="mt-3">
                    <button 
                      className="w-full px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleStudentClick(student);
                      }}
                    >
                      <Eye size={14} className="mr-1" />
                      Xem chi tiết
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student, index) => (
            <div 
              key={student._id || student.id} 
              className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white rounded-xl border border-gray-200"
              onClick={() => handleStudentClick(student)}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <span className="text-sm font-bold text-white">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{student.email}</p>
                    
                    {/* Attendance Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {student.attendanceCount || 0} lần điểm danh
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className={`px-2 py-1 rounded-full font-medium ${getAttendanceStatusColor(student.attendanceRate || 0)}`}>
                          {student.attendanceRate || 0}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                {showActions && (
                  <div className="flex-shrink-0">
                    <button 
                      className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleStudentClick(student);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy học sinh nào</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có học sinh nào trong lớp'}
          </p>
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
});

StudentList.displayName = 'StudentList';

export default StudentList;