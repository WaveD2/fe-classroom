import React, { useState, useEffect, useCallback, memo} from 'react';
import { 
  Plus, 
  BookOpen, 
  Grid, 
  List,
  Shield
} from 'lucide-react';
import { ClassI, ROLE, PaginationInfo } from '../types';
import { getClassByAdmin, deleteClass, createClassByAdmin } from '../api/class';
import SearchBar from '../components/common/Search';
import PaginationBar from '../components/common/PaginationBar';
import ClassFormModal from '../components/class/ClassFormModal';
import ClassMembersModal from '../components/class/ClassMembersModal';
import StudentDetailModal from '../components/user/StudentDetailModal';
import TeacherDetailModal from '../components/user/TeacherDetailModal';
import { showSuccess, showError } from '../components/Toast';
import { ListSkeleton } from '../components/loading/LoadingSkeleton';
import ClassStats from '../components/class/ClassStats';
import ClassCard from '../components/class/ClassCard';
import ClassList from '../components/class/ClassList';
import ConfirmModal from '../components/common/ConfirmModal';

const ClassManagement: React.FC<{ userRole: string }> = memo(({ userRole }) => {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleCreateClass = async (data: { name: string; description: string; teacherId: string; code?: string; academicCredit: number }) => {
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


  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
  }, []);

  const handleManageClass = useCallback((classItem: ClassI) => {
    setSelectedClass(classItem);
    setShowMembersModal(true);
  }, []);

  const handleDeleteClass = useCallback(async (classId: string) => {
    try {
      await deleteClass(classId);
      showSuccess('Xóa lớp học thành công');
      await fetchClasses();
      setSelectedClass(null);
      setShowDeleteModal(false);
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa lớp học');
    } 
  }, [fetchClasses]);

  const handleViewTeacher = useCallback((teacher: any) => {
    setSelectedTeacher(teacher);
    setShowTeacherDetail(true);
  }, []);

  const handleViewStudent = useCallback((student: any) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  }, []);

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <ClassStats 
          classes={classes} 
          pagination={pagination} 
          loading={loading} 
        />
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
                  <ClassCard
                    key={classItem.id || classItem._id}
                    classItem={classItem}
                    index={index}
                    onManageClass={handleManageClass}
                    onDeleteClass={(cls)=> { 
                      setSelectedClass(cls)
                      setShowDeleteModal(true)
                    }}
                    onViewTeacher={handleViewTeacher}
                  />
                ))}
              </div>
            ) : (
              <ClassList
                classes={classes}
                onManageClass={handleManageClass}
                onDeleteClass={(cls : ClassI)=> { 
                  setSelectedClass(cls)
                  setShowDeleteModal(true)
                }}
                onViewTeacher={handleViewTeacher}
              />
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
          onStudentClick={handleViewStudent}
          onTeacherClick={handleViewTeacher}
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

      <ConfirmModal
        open={showDeleteModal}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa ${selectedClass?.name} không? Hành động này không thể hoàn tác.`}
        onClose={()=> setShowDeleteModal(false)}
        onConfirm={()=> handleDeleteClass(selectedClass?._id || selectedClass?.id || "")}
      />
    </div>
  );
});

ClassManagement.displayName = 'ClassManagement';

export default ClassManagement;
