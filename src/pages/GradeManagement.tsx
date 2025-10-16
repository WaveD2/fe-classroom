import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  BarChart3, 
  BookOpen, 
  Users, 
  Plus,
  Grid,
  List,
  AlertCircle,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import Button from '../components/common/Button';
import GradeList from '../components/grade/GradeList';
import GradeStatistics from '../components/grade/GradeStatistics';
import GradeFormModal from '../components/grade/GradeFormModal';
import BulkGradeModal from '../components/grade/BulkGradeModal';
import ExcelGradeUploader from '../components/grade/ExcelGradeUploader';
import { useGrades, useClassGradeStatistics } from '../hook/useGrade';
import { ClassI, GradeFilter, ROLE, Grade, GradeData, User as UserType } from '../types';
import { getClass, getClassDetail } from '../api/class';
import { showSuccess, showError } from '../components/Toast';
import * as gradeApi from '../api/grade';

 
const GradeManagement = memo(() => {
  const navigate = useNavigate();
  
  const [user] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
 
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassI | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'grades' | 'statistics'>('grades');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [gradeFilters, setGradeFilters] = useState<GradeFilter>({});
  const [error, setError] = useState<string | null>(null);
  
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
  
  const { 
    grades, 
    loading: gradesLoading,
    error: gradesError,
    refetch: fetchGrades,
    updateGradeComponent,
    calculateFinalGrade,
    calculateFinalGradeClass,
    deleteGrade: deleteGradeById
  } = useGrades(selectedClassId, gradeFilters);
  
  const { 
    statistics, 
    loading: statisticsLoading,
    error: statisticsError,
    refetch: fetchStatistics 
  } = useClassGradeStatistics(selectedClassId);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      setError(null);
      try {
        const response = await getClass();
        if (response?.data?.classes) {
          const classList = response.data.classes;
          setClasses(classList);
          
          if (classList.length > 0) {
            const firstClassId = classList[0]._id || classList[0].id;
            setSelectedClassId(firstClassId);
          }
        }
      } catch (error: any) {
        console.error('Error fetching classes:', error);
        setError('Có lỗi xảy ra khi tải danh sách lớp');
        showError(error.message || 'Không thể tải danh sách lớp');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setSelectedClassDetail(null);
      return;
    }

    const fetchClassDetail = async () => {
      setLoadingClassDetail(true);
      setError(null);
      try {
        const response = await getClassDetail(selectedClassId);
        if (response?.data) {
          setSelectedClassDetail(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching class detail:', error);
        setError('Có lỗi xảy ra khi tải chi tiết lớp');
        showError(error.message || 'Không thể tải chi tiết lớp');
      } finally {
        setLoadingClassDetail(false);
      }
    };

    fetchClassDetail();
  }, [selectedClassId]);

  useEffect(() => {
    if (gradesError) {
      setError(gradesError);
    } else if (statisticsError) {
      setError(statisticsError);
    }
  }, [gradesError, statisticsError]);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setSelectedClassDetail(null);
    setGradeFilters({});
    setError(null);
  }, []);

  const handleTabChange = useCallback((tab: 'grades' | 'statistics') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'statistics' && selectedClassId) {
      fetchStatistics();
    }
  }, [selectedClassId, fetchStatistics]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleUpdateGradeComponent = useCallback(async (studentId: string, data: Partial<GradeData>) => {
    try {
      await updateGradeComponent(studentId, data);
      showSuccess('Cập nhật điểm thành công');
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi cập nhật điểm');
      throw error;
    }
  }, [updateGradeComponent]);

  const handleCalculateFinal = useCallback(async (studentId: string) => {
    try {
      await calculateFinalGrade(studentId);
      showSuccess('Tính điểm tổng kết thành công');
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi tính điểm');
      throw error;
    }
  }, [calculateFinalGrade]);

  const handleCalculateFinalClass = useCallback(async () => {
    if (!selectedClassId) return;
    
    try {
      const response = await calculateFinalGradeClass();
      showSuccess(`Đã tính điểm tổng kết cho ${response.data.totalUpdated} học sinh`);
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi tính điểm cho lớp');
    }
  }, [selectedClassId, calculateFinalGradeClass]);

  const handleDeleteGrade = useCallback(async (gradeId: string) => {
    try {
      await deleteGradeById(gradeId);
      showSuccess('Xóa điểm thành công');
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi xóa điểm');
      throw error;
    }
  }, [deleteGradeById]);

  const handleEditGrade = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
    setModalMode('edit');
    setShowGradeModal(true);
  }, []);

  const handleViewGrade = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
    setModalMode('view');
    setShowGradeModal(true);
  }, []);

  const handleCreateGradeClick = useCallback(() => {
    if (!selectedClassDetail?.students || selectedClassDetail.students.length === 0) {
      showError('Lớp chưa có học sinh nào');
      return;
    }
    setSelectedGrade(null);
    setModalMode('create');
    setShowGradeModal(true);
  }, [selectedClassDetail]);

  const handleBulkUpdateClick = useCallback(() => {
    if (!selectedClassDetail?.students || selectedClassDetail.students.length === 0) {
      showError('Lớp chưa có học sinh nào');
      return;
    }
    setShowBulkModal(true);
  }, [selectedClassDetail]);

  const handleBulkUpdate = useCallback(async (grades: { studentId: string; gradeData: Partial<GradeData> }[]) => {
    await gradeApi.bulkUpdateGrades(selectedClassId, grades);
  }, [selectedClassId]);

  const students: UserType[] = selectedClassDetail?.students || [];
  const canManageGrades = user?.role === ROLE.TEACHER || user?.role === ROLE.ADMIN;

  if (loadingClasses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách lớp...</p>
        </div>
      </div>
    );
  }

  if (!classes?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
            <p className="text-gray-500 mb-6">
              {user?.role === ROLE.STUDENT 
                ? 'Bạn chưa tham gia lớp học nào để xem điểm số.'
                : 'Bạn chưa có lớp học nào để quản lý điểm.'
              }
            </p>
            <Button onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="flex-1 px-4 py-2 border outline-0 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              >
                {classes.map((classItem) => (
                  <option key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                    {classItem.name} ({classItem.studentCount || 0} học sinh)
                  </option>
                ))}
              </select>

              {loadingClassDetail && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'grades' && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Dạng bảng"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Dạng lưới"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              )}

              {canManageGrades && selectedClassDetail && (
                <>
                  <button
                    onClick={handleCreateGradeClick}
                    disabled={students.length === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Tạo điểm mới"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Tạo điểm</span>
                  </button>
                  <button
                    onClick={handleBulkUpdateClick}
                    disabled={students.length === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Nhập hàng loạt"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Hàng loạt</span>
                  </button>
                  <button
                    onClick={() => setShowExcelUploader(true)}
                    disabled={students.length === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Import từ Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>
                  <button
                    onClick={handleCalculateFinalClass}
                    disabled={!grades || grades.length === 0 || gradesLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Tính điểm cả lớp"
                  >
                    <Calculator className="w-4 h-4" />
                    <span className="hidden sm:inline">Tính điểm</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {!selectedClassDetail && selectedClassId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin lớp học...</p>
            </div>
          </div>
        )}

        {/* Main content when class detail loaded */}
        {selectedClassDetail && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Compact Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex px-4">
                <button
                  onClick={() => handleTabChange('grades')}
                  className={`flex py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'grades'
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Award className="w-4 h-4 inline mr-2" />
                  {user?.role === ROLE.STUDENT ? 'Điểm của tôi' : 'Danh sách điểm'}
                </button>
                {canManageGrades && (
                  <button
                    onClick={() => handleTabChange('statistics')}
                    className={`flex py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'statistics'
                        ? 'border-blue-500 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Thống kê
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content - Full height */}
            <div className="p-4">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Lỗi:</span>
                      <span className="ml-2">{error}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'grades' && (
                <GradeList
                  grades={grades}
                  loading={gradesLoading}
                  onEdit={handleEditGrade}
                  onDelete={handleDeleteGrade}
                  onView={handleViewGrade}
                  showActions={canManageGrades}
                  showStudent={true}
                  viewMode={viewMode}
                />
              )}

              {activeTab === 'statistics' && (
                <GradeStatistics
                  statistics={statistics}
                  loading={statisticsLoading}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedClassDetail && (
        <>
          <GradeFormModal
            isOpen={showGradeModal}
            onClose={() => {
              setShowGradeModal(false);
              setSelectedGrade(null);
            }}
            classId={selectedClassId}
            students={students}
            classData={selectedClassDetail}
            grade={selectedGrade || undefined}
            mode={modalMode}
            onUpdateComponent={handleUpdateGradeComponent}
            onCalculateFinal={handleCalculateFinal}
            onDelete={handleDeleteGrade}
            onSuccess={() => {
              fetchGrades();
              if (activeTab === 'statistics') {
                fetchStatistics();
              }
            }}
          />

          <BulkGradeModal
            isOpen={showBulkModal}
            onClose={() => setShowBulkModal(false)}
            classId={selectedClassId}
            students={students}
            classData={selectedClassDetail}
            onBulkUpdate={handleBulkUpdate}
            onSuccess={() => {
              fetchGrades();
              if (activeTab === 'statistics') {
                fetchStatistics();
              }
            }}
          />

          <ExcelGradeUploader
            isOpen={showExcelUploader}
            onClose={() => setShowExcelUploader(false)}
            classId={selectedClassId}
            onSuccess={() => {
              fetchGrades();
              if (activeTab === 'statistics') {
                fetchStatistics();
              }
            }}
          />
        </>
      )}
    </div>
  );
});

GradeManagement.displayName = 'GradeManagement';

export default GradeManagement;
