import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BarChart3, ArrowLeft, BookOpen, Users } from 'lucide-react';
import Button from '../components/Button';
import GradeList from '../components/GradeList';
import GradeStatistics from '../components/GradeStatistics';
import GradeFilters from '../components/GradeFilters';
import { useGrades, useMyGrades, useClassGradeStatistics } from '../hook/useGrade';
// import { useAuth } from '../contexts/AuthContext';
import { ClassI, GradeFilter, ROLE } from '../types';
import { getClass } from '../api/class';

const GradeManagement = () => {
  const navigate = useNavigate();
  const [user] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'grades' | 'statistics'>('grades');
  const [gradeFilters, setGradeFilters] = useState<GradeFilter>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks for grade management
  const { 
    grades, 
    loading: gradesLoading, 
    fetchGrades 
  } = useGrades(selectedClassId, gradeFilters);
  
  const { 
    myGrades, 
    loading: myGradesLoading, 
    fetchMyGrades 
  } = useMyGrades(selectedClassId);
  
  const { 
    statistics, 
    loading: statisticsLoading, 
    fetchStatistics 
  } = useClassGradeStatistics(selectedClassId);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await getClass();
        if (response?.data) {
          setClasses(response.data);
          if (response.data.length > 0) {
            setSelectedClassId(response.data[0]._id || response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      if (user?.role === ROLE.STUDENT) {
        fetchMyGrades();
      } else {
        fetchGrades();
        if (activeTab === 'statistics') {
          fetchStatistics();
        }
      }
    }
  }, [selectedClassId, user?.role, activeTab, fetchGrades, fetchMyGrades, fetchStatistics]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setGradeFilters({});
    setError(null);
  };

  const handleTabChange = (tab: 'grades' | 'statistics') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'statistics' && selectedClassId) {
      fetchStatistics();
    }
  };

  const selectedClass = classes.find(c => (c._id || c.id) === selectedClassId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lớp học nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bạn chưa tham gia lớp học nào để xem điểm số.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/classes')}>
                  Xem danh sách lớp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.role === ROLE.STUDENT ? 'Điểm số của tôi' : 'Quản lý điểm số'}
                  </h1>
                  <p className="text-gray-600">
                    {user?.role === ROLE.STUDENT 
                      ? 'Xem điểm số và thống kê học tập' 
                      : 'Quản lý điểm số học sinh trong lớp'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Class Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Lớp học:</span>
              </div>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {classes.map((classItem) => (
                  <option key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedClass && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedClass.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedClass.description || 'Không có mô tả'}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Mã lớp: {selectedClass.uniqueCode}</span>
                  <span>{selectedClass.studentCount} học sinh</span>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => handleTabChange('grades')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'grades'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Award className="w-4 h-4 inline mr-2" />
                  {user?.role === ROLE.STUDENT ? 'Điểm của tôi' : 'Danh sách điểm'}
                </button>
                {(user?.role === ROLE.TEACHER || user?.role === ROLE.ADMIN) && (
                  <button
                    onClick={() => handleTabChange('statistics')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'statistics'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Thống kê
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="font-medium">Lỗi:</span>
                    <span className="ml-2">{error}</span>
                  </div>
                </div>
              )}
              
              {activeTab === 'grades' && (
                <div className="space-y-6">
                  {(user?.role === ROLE.TEACHER || user?.role === ROLE.ADMIN) && (
                    <GradeFilters
                      onFilterChange={setGradeFilters}
                      onReset={() => setGradeFilters({})}
                      loading={gradesLoading}
                    />
                  )}
                  
                  {user?.role === ROLE.STUDENT ? (
                    <div>
                      {myGradesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Đang tải điểm số...</p>
                        </div>
                      ) : myGrades ? (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-blue-900">
                                  Điểm trung bình: {myGrades.averageGrade.toFixed(1)}%
                                </h3>
                                <p className="text-blue-700">
                                  Tổng số điểm: {myGrades.totalGrades}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-900">
                                  {myGrades.averageGrade >= 90 ? 'Xuất sắc' :
                                   myGrades.averageGrade >= 80 ? 'Giỏi' :
                                   myGrades.averageGrade >= 70 ? 'Khá' :
                                   myGrades.averageGrade >= 60 ? 'Trung bình' : 'Yếu'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <GradeList
                            grades={myGrades.grades}
                            loading={false}
                            showActions={false}
                            showStudent={false}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Chưa có điểm số nào</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <GradeList
                      grades={grades}
                      loading={gradesLoading}
                      onEdit={(grade) => {
                        // Handle edit - could open a modal
                        console.log('Edit grade:', grade);
                      }}
                      onDelete={(gradeId) => {
                        // Handle delete
                        console.log('Delete grade:', gradeId);
                      }}
                      onView={(grade) => {
                        // Handle view
                        console.log('View grade:', grade);
                      }}
                      showActions={true}
                      showStudent={true}
                    />
                  )}
                </div>
              )}

              {activeTab === 'statistics' && (
                <GradeStatistics
                  statistics={statistics}
                  loading={statisticsLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;
