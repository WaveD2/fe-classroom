import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Users, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Grid, 
  List,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';
import { ClassI, ROLE, PaginationInfo } from '../types';
import { getClassByAdmin, deleteClass, createClassByAdmin } from '../api/class';
import SearchBar from '../components/Search';
import PaginationBar from '../components/PaginationBar';
import ClassFormModal from '../components/ClassFormModal';
import ClassMembersModal from '../components/ClassMembersModal';
import StudentDetailModal from '../components/StudentDetailModal';
import TeacherDetailModal from '../components/TeacherDetailModal';
import { showSuccess, showError } from '../components/Toast';
import { ListSkeleton, StatsSkeleton } from '../components/LoadingSkeleton';

const ClassManagement: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassI | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showTeacherDetail, setShowTeacherDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getClassByAdmin({
        search: search || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response?.data?.classes) {
        setClasses(response.data.classes);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showError('Có lỗi xảy ra khi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    if (userRole !== ROLE.ADMIN) return;
    fetchClasses();
  }, [userRole, pagination.page, pagination.limit, search, fetchClasses]);

  const handleCreateClass = async (data: { name: string; description: string; teacherId: string; code?: string }) => {
    try {
      const response = await createClassByAdmin(data);
      if (response?.success) {
        showSuccess('Tạo lớp học thành công');
        await fetchClasses();
      } else {
        showError(response?.message || 'Có lỗi xảy ra khi tạo lớp học');
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp học');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    
    try {
      await deleteClass(classId);
      showSuccess('Xóa lớp học thành công');
      await fetchClasses();
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa lớp học');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
  };

  if (userRole !== ROLE.ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600">Chỉ quản trị viên mới có thể truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Quản lý lớp học
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">Tạo và quản lý các lớp học trong hệ thống</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Tạo lớp mới
              </button>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Tìm kiếm lớp học theo tên, mã lớp hoặc giáo viên..."
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
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                  <p className="text-sm text-gray-600">Tổng lớp học</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.filter(c => c.status === 'open').length}
                  </p>
                  <p className="text-sm text-gray-600">Đang hoạt động</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Tổng học sinh</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(classes.filter(c => c.teacher).map(c => c.teacher?.id)).size}
                  </p>
                  <p className="text-sm text-gray-600">Giáo viên</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        {loading ? (
          <ListSkeleton />
        ) : (
          <>
            {/* Classes Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map((classItem, index) => (
                  <div
                    key={classItem.id || classItem._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-purple-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{classItem.name}</h3>
                            <p className="text-purple-100 text-sm">Lớp học</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          classItem.status === 'open' 
                            ? 'bg-green-500/20 text-green-100' 
                            : 'bg-red-500/20 text-red-100'
                        }`}>
                          {classItem.status === 'open' ? 'Hoạt động' : 'Đã đóng'}
                        </div>
                      </div>
                      <p className="text-purple-100 text-sm">
                        Mã: <span className="font-mono font-medium">{classItem.uniqueCode}</span>
                      </p>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{classItem.studentCount || 0} học sinh</p>
                        </div>
                        
                        {classItem.teacher && (
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors"
                            onClick={() => {
                              setSelectedTeacher(classItem.teacher);
                              setShowTeacherDetail(true);
                            }}
                          >
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 truncate">{classItem.teacher.name}</p>
                          </div>
                        )}
                        
                        {classItem.description && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 line-clamp-2">{classItem.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedClass(classItem);
                              setShowMembersModal(true);
                            }}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <Users className="w-4 h-4" />
                            Quản lý lớp
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedClass(classItem);
                                setShowMembersModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Quản lý"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classItem.id || classItem._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp học</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã lớp</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giáo viên</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes.map((classItem) => (
                        <tr key={classItem.id || classItem._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                              {classItem.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{classItem.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-900">{classItem.uniqueCode}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div 
                              className={`text-sm ${classItem.teacher ? 'text-gray-900 cursor-pointer hover:text-purple-600 transition-colors' : 'text-gray-500'}`}
                              onClick={() => {
                                if (classItem.teacher) {
                                  setSelectedTeacher(classItem.teacher);
                                  setShowTeacherDetail(true);
                                }
                              }}
                            >
                              {classItem.teacher ? classItem.teacher.name : 'Chưa có'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Users className="w-4 h-4" />
                              {classItem.studentCount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              classItem.status === 'open' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {classItem.status === 'open' ? 'Đang học' : 'Đã đóng'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedClass(classItem);
                                  setShowMembersModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Quản lý thành viên"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(classItem.id || classItem._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Xóa lớp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {classes.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
                <p className="text-gray-500 mb-6">
                  {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Tạo lớp học đầu tiên để bắt đầu quản lý'}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Tạo lớp mới
                  </button>
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
                  onChangeLimit={handleLimitChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ClassFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />

      {selectedClass && (
        <ClassMembersModal
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
          onRefresh={fetchClasses}
          onStudentClick={(student) => {
            setSelectedStudent(student);
            setShowStudentDetail(true);
          }}
          onTeacherClick={(teacher) => {
            setSelectedTeacher(teacher);
            setShowTeacherDetail(true);
          }}
        />
      )}

      <StudentDetailModal
        isOpen={showStudentDetail}
        onClose={() => {
          setShowStudentDetail(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      <TeacherDetailModal
        isOpen={showTeacherDetail}
        onClose={() => {
          setShowTeacherDetail(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default ClassManagement;
