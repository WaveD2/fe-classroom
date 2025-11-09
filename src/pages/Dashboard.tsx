import { useState, useEffect, useCallback, memo } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import SearchBar from '../components/common/Search';
import ClassGrid from '../components/class/ClassGrid';
import QRScanner from '../components/QR/QrScan';
import Pagination from '../components/common/Pagination';
import { ClassI, ROLE, ClassFilter, PaginationInfo } from '../types';
import { createClass, deleteClass, getClass, getClassByAdmin, updateClass } from '../api/class';
import { showError, showSuccess } from '../components/Toast';
import ClassStats from '../components/class/ClassStats';
import ClassFormModal from '../components/class/ClassFormModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = memo(({ userRole }: { userRole: string }) => {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false); 
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);


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

  useEffect(() => {
    fetchClassesData(1, '');
  }, [userRole, fetchClassesData]); 

  useEffect(() => {
    if (searchTerm === '') return;  
    
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchClassesData(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchClassesData]);  

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchClassesData(page, searchTerm);
  }, [fetchClassesData, searchTerm]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
 
  const handleCreateClass = useCallback(async (data: { name: string; description: string; teacherId: string; code?: string, academicCredit: number }) => {
    try {
      const response = await createClass(data);
      if (response?.data) {
        await fetchClassesData(1, searchTerm);
        setShowCreateClass(false);
        showSuccess('Tạo lớp học thành công');
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp học');
    }
  }, [fetchClassesData, searchTerm]);

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
    try {
      await deleteClass(id);
      await fetchClassesData(pagination.page, searchTerm);
      showSuccess('Xóa lớp học thành công');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa lớp học');
    }
  }, [fetchClassesData, pagination.page, searchTerm]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm lớp học theo tên, mã lớp..."
                value={searchTerm}
                onChange={handleSearchChange}
                delay={500}
              />
            </div>
            
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

              {/* {userRole === ROLE.TEACHER && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateClass(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo lớp mới</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )} */}

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
        </div>
      </div>

      <div className="p-4 flex-shrink-0">
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
            <ClassStats
              classes={classes} 
              pagination={pagination} 
              loading={isLoading} 
            />
        )}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <ClassGrid
                classes={classes}
                onClassClick={(cls: ClassI) => navigate(`/class/${cls._id}`)}
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

            <div className="mt-4 flex-shrink-0">
              <Pagination
                currentPage={Number(pagination.page)}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
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
        <ClassFormModal
          isOpen={showCreateClass}
          onClose={() => setShowCreateClass(false)}
          onSubmit={handleCreateClass}
      />
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;