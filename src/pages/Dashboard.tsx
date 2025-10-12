import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  QrCode,
  Users,
  GraduationCap,
  Activity,
  BarChart3,
  Grid,
  List,
  ArrowRight
} from 'lucide-react';
import ClassDetailView from '../components/ClassDetailView';
import Button from '../components/Button';
import SearchBar from '../components/Search';
import ClassGrid from '../components/ClassGrid';
import QRScanner from '../components/QrScan';
import Pagination from '../components/Pagination';
import { ClassI, ROLE, ClassFilter, PaginationInfo } from '../types';
import { createClass, deleteClass, getClass, getClassByAdmin, updateClass } from '../api/class';
import { showError, showSuccess } from '../components/Toast';

const Dashboard = memo(({ userRole }: { userRole: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false); 
  const [selectedClass, setSelectedClass] = useState<ClassI | null>(null);
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Memoized stats calculation
  const stats = useMemo(() => {
    const activeClasses = classes.filter(c => c.status === 'open').length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const uniqueTeachers = new Set(classes.filter(c => c.teacher).map(c => c.teacher?.id)).size;
    const averageStudents = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

    return {
      totalClasses: pagination.total,
      activeClasses,
      totalStudents,
      uniqueTeachers,
      averageStudents
    };
  }, [classes, pagination.total]);

  // Fetch classes data - only depend on userRole and pagination.limit
  const fetchClassesData = useCallback(async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const filter: ClassFilter = {
        page,
        limit: pagination.limit,
        search: search || undefined
      };

      let response;
      if (userRole === ROLE.ADMIN) {
        response = await getClassByAdmin(filter);
      } else {
        response = await getClass(filter);
      }

      if (response?.data) {
        const { classes: classesData, pagination: paginationData } = response.data;
        setClasses(classesData || []);
        setPagination(paginationData || { page: 1, limit: 12, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [userRole, pagination.limit]);

  // Initial load - only when userRole changes
  useEffect(() => {
    fetchClassesData(1, '');
  }, [userRole, fetchClassesData]); // Include fetchClassesData

  // Search with debounce - separate effect
  useEffect(() => {
    if (searchTerm === '') return; // Don't call API if search is empty
    
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchClassesData(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchClassesData]); // Include fetchClassesData

  // Page change
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchClassesData(page, searchTerm);
  }, [fetchClassesData, searchTerm]);

  // Search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // View mode change
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Create class
  const handleCreateClass = useCallback(async (newClass: { name: string; code: string }) => {
    try {
      const response = await createClass(newClass);
      if (response?.data) {
        await fetchClassesData(1, searchTerm);
        setShowCreateClass(false);
        showSuccess('Tạo lớp học thành công');
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp học');
    }
  }, [fetchClassesData, searchTerm]);

  // Update class
  const handleUpdateClass = useCallback(async (id: string, updatedClass: Partial<ClassI>) => {
    try {
      const response = await updateClass(id, updatedClass);
      if (response?.data) {
        await fetchClassesData(pagination.page, searchTerm);
        showSuccess('Cập nhật lớp học thành công');
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp học');
    }
  }, [fetchClassesData, pagination.page, searchTerm]);

  // Delete class
  const handleDeleteClass = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    
    try {
      await deleteClass(id);
      await fetchClassesData(pagination.page, searchTerm);
      showSuccess('Xóa lớp học thành công');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa lớp học');
    }
  }, [fetchClassesData, pagination.page, searchTerm]);

  // Get role-specific stats
  const getStatsForRole = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return [
          {
            icon: BookOpen,
            label: 'Lớp đã tham gia',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp đang học',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Bạn học cùng',
            value: Math.max(0, stats.totalStudents - 1),
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: GraduationCap,
            label: 'Giáo viên',
            value: stats.uniqueTeachers,
            color: 'orange',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-600'
          }
        ];
      case ROLE.TEACHER:
        return [
          {
            icon: BookOpen,
            label: 'Lớp của tôi',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp đang dạy',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Tổng học sinh',
            value: stats.totalStudents,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: BarChart3,
            label: 'TB học sinh/lớp',
            value: stats.averageStudents,
            color: 'indigo',
            bgColor: 'bg-indigo-100',
            textColor: 'text-indigo-600'
          }
        ];
      case ROLE.ADMIN:
        return [
          {
            icon: BookOpen,
            label: 'Tổng lớp học',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp hoạt động',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Tổng học sinh',
            value: stats.totalStudents,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: GraduationCap,
            label: 'Giáo viên',
            value: stats.uniqueTeachers,
            color: 'orange',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-600'
          }
        ];
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'Lớp học của tôi';
      case ROLE.TEACHER:
        return 'Quản lý lớp học';
      case ROLE.ADMIN:
        return 'Dashboard quản trị';
      default:
        return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'Tham gia và theo dõi lớp học của bạn';
      case ROLE.TEACHER:
        return 'Quản lý và theo dõi các lớp học của bạn';
      case ROLE.ADMIN:
        return 'Tổng quan hệ thống và quản lý toàn bộ';
      default:
        return 'Quản lý lớp học';
    }
  };

  const getGradientClass = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'from-green-600 to-blue-600';
      case ROLE.TEACHER:
        return 'from-purple-600 to-blue-600';
      case ROLE.ADMIN:
        return 'from-indigo-600 to-purple-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  if (selectedClass) {
    return (
      <ClassDetailView
        classData={selectedClass}
        userRole={userRole}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 bg-gradient-to-r ${getGradientClass()} rounded-xl`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {getTitle()}
                  </h1>
                  <p className="text-gray-600 text-sm">{getSubtitle()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {userRole === ROLE.STUDENT && (
                <Button
                  size="sm"
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Quét QR</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}

              {userRole === ROLE.TEACHER && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateClass(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo lớp mới</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}

              {userRole === ROLE.ADMIN && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowCreateClass(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tạo lớp</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Quét QR</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm lớp học theo tên, mã lớp..."
                value={searchTerm}
                onChange={handleSearchChange}
                delay={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Xem dạng lưới"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
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

      {/* Stats Section - Compact */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 h-16">
                <div className="animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="w-12 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {getStatsForRole().map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 ${stat.bgColor} rounded-lg`}>
                      <IconComponent className={`w-4 h-4 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content - Flexible height */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Class Grid - Takes remaining space */}
            <div className="flex-1 min-h-0">
              <ClassGrid
                classes={classes}
                onClassClick={setSelectedClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
              />
            </div>

            {/* Empty State */}
            {classes.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Không tìm thấy lớp học' : 'Chưa có lớp học nào'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Thử thay đổi từ khóa tìm kiếm' 
                      : userRole === ROLE.STUDENT 
                        ? 'Tham gia lớp học bằng cách quét QR code'
                        : 'Tạo lớp học đầu tiên để bắt đầu'
                    }
                  </p>
                  {!searchTerm && userRole !== ROLE.STUDENT && (
                    <Button
                      onClick={() => setShowCreateClass(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Tạo lớp mới
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination - Fixed at bottom */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex-shrink-0">
                <Pagination
                  currentPage={Number(pagination.page)}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        setClasses={setClasses}
      />

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Tạo lớp học mới</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const code = (form.elements.namedItem("code") as HTMLInputElement).value;
                handleCreateClass({ name, code });
              }}
              className="space-y-4"
            >
              <input
                type="text"
                name="name"
                placeholder="Tên lớp học"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="text"
                name="code"
                placeholder="Mã lớp (tùy chọn)"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <div className="flex justify-end gap-3">
                <Button 
                  type="button"
                  onClick={() => setShowCreateClass(false)} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Tạo lớp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;