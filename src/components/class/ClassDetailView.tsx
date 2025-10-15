import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { QrCode, Users, Clock, History, Download, ArrowLeft, Calendar, BookOpen, GraduationCap, UserCheck, Award, BarChart3 } from 'lucide-react'; 
import QRGenerator from '../QR/QRGenerator';
import StudentList from '../user/StudentList';
import AttendanceHistory from '../attendance/AttendanceHistory';
import QRHistoryList from '../QR/QRHistoryList';
import StudentDetailModal from '../user/StudentDetailModal';
import QRDetailModal from '../QR/QRDetailModal';
import ManualAttendanceModal from '../grade/ManualAttendanceModal';
import GradeList from '../grade/GradeList';
import GradeStatistics from '../grade/GradeStatistics';
import GradeFormModal from '../grade/GradeFormModal';
import GradeFilters from '../grade/GradeFilters';
import LoadingState from '../loading/LoadingState';
import { ROLE, STATUS_CLASS } from '../../types';
import type { ClassI, User, QrHistoryI, StudentWithAttendance, Grade, GradeFilter,  } from '../../types'; 
import { getAllQR } from '../../api/qr';
import { exportAttendanceClass, getClassDetail } from '../../api/class';
import { useGrades, useClassGradeStatistics } from "../../hook/useGrade"
const ClassDetailView = ({ classData, userRole, onBack }: {
  classData: ClassI;
  userRole: string;
  onBack: () => void;
}) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showManualAttendance, setShowManualAttendance] = useState(false);
  const [listStudent, setListStudent] = useState<StudentWithAttendance[]>([]);
  const [qrHistory, setQrHistory] = useState<QrHistoryI[]>([]);
  const [activeTab, setActiveTab] = useState("students");
  const [selectedQR, setSelectedQR] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teacher, setTeacher] = useState<User | null>(null);
  
  // Grade Management states
  const [selectedGrade, setSelectedGrade] = useState<Grade | undefined>(undefined);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeModalMode, setGradeModalMode] = useState<'view' | 'edit' | 'create'>('create');
  const [gradeFilters, setGradeFilters] = useState<GradeFilter>({});

  // Grade Management hooks
  const { 
    grades, 
    loading: gradesLoading,
    refetch: fetchGrades,
    updateGradeComponent: updateGrade,
    calculateFinalGrade,
    deleteGrade: deleteGradeById
  } = useGrades(classData._id || classData.id, gradeFilters);

  const { 
    statistics,
    loading: statisticsLoading,
    refetch: fetchStatistics
  } = useClassGradeStatistics(classData._id || classData.id);

  const deleteGrade = async (gradeId: string) => {
    await deleteGradeById(gradeId);
  };

  const refreshClassData = async () => {
    setIsLoading(true);
    try {
      const response = await getClassDetail(classData._id || classData.id);
      if (response?.data) {
        // Filter out students from the students array (remove teachers)
        const students = response.data.students?.filter((item: StudentWithAttendance) => item.role === ROLE.STUDENT) || [];
        setListStudent(students);
        
        // Find teacher for admin view
        const teacherData = response.data.students?.find((item: StudentWithAttendance) => item.role === ROLE.TEACHER);
        if (teacherData) {
          setTeacher(teacherData);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    const fetchClass = async () => {
      setIsLoading(true);
      try {
        const response = await getClassDetail(classData._id || classData.id);
        if (response?.data) {
          // Filter out students from the students array (remove teachers)
          const students = response.data.students?.filter((item: StudentWithAttendance) => item.role === ROLE.STUDENT) || [];
          setListStudent(students);
          
          // Find teacher for admin view
          const teacherData = response.data.students?.find((item: StudentWithAttendance) => item.role === ROLE.TEACHER);
          if (teacherData) {
            setTeacher(teacherData);
          }
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setIsLoading(false);
      }
    };


    const fetchQrHistory = async () => {
      try {
        const response = await getAllQR({ classId: classData._id || classData.id });
        console.log("response:::", response);
        if (response?.data?.length) {
          setQrHistory(response.data);
        }
      } catch (error) {
        console.error("Error fetching QR history:", error);
      }
    };


    switch (activeTab) {
      case 'students':
        fetchClass();
        break;
      case 'attendance':
        fetchClass();
        break;
      case 'qr':
        if (userRole === ROLE.TEACHER) fetchQrHistory();
        break;
      case 'grades':
        fetchGrades();
        break;
      case 'statistics':
        fetchStatistics();
        break;
      default:
        break;
    }
  }, [activeTab, classData._id, classData.id, userRole]);
  


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">Quay lại</span>
            </button>
          </div>

          <div className="pb-4 sm:pb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                    {classData.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    Mã lớp: <span className="font-mono font-medium">{classData.uniqueCode}</span>
                  </span>
                    <span className={`inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium w-fit ${
                      classData.status === STATUS_CLASS.OPEN 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {classData.status === STATUS_CLASS.OPEN ? 'Đang học' : 'Đã đóng'}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {classData.studentCount || listStudent.length} học sinh
                    </span>
                  </div>
                </div>
              </div>


              {userRole === ROLE.ADMIN && teacher && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">Giáo viên phụ trách</p>
                      <p className="text-sm sm:text-lg font-semibold text-blue-900 break-words">{teacher.name}</p>
                      <p className="text-xs sm:text-sm text-blue-700 break-all">{teacher.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {(userRole !== ROLE.STUDENT) && (
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button 
                    onClick={() => setShowManualAttendance(true)} 
                    className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Điểm danh thủ công</span>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setSelectedGrade(undefined);
                      setGradeModalMode('create');
                      setShowGradeModal(true);
                    }} 
                    className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Tạo điểm</span>
                  </Button>
                  
                    <>
                      <Button 
                        onClick={async () => {
                          try {
                            const data: any = await exportAttendanceClass(classData._id || classData.id);
                            const blob = new Blob([data], { type: "application/octet-stream" });
                            const blobUrl = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = `${classData.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
                            a.click();
                            URL.revokeObjectURL(blobUrl);
                          } catch (error) {
                            console.error('Export error:', error);
                          }
                        }} 
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">Xuất dữ liệu</span>
                      </Button>
                      <Button 
                        onClick={() => setShowQRGenerator(true)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                      >
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">Tạo mã QR</span>
                      </Button>
                    </>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="w-full px-3 sm:px-4 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {[
              { key: "students", label: "Học sinh", icon: Users, shortLabel: "HS" },
              { key: "attendance", label: "Điểm danh", icon: Clock, shortLabel: "DD" },
              { key: "grades", label: "Điểm số", icon: Award, shortLabel: "Điểm" },
              { key: "statistics", label: "Thống kê", icon: BarChart3, shortLabel: "TK" },
              ...(userRole === ROLE.TEACHER ? [{ key: "qr", label: "Lịch sử QR", icon: History, shortLabel: "QR" }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.key 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm sm:text-base">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div key={activeTab} className="animate-fadeIn">
            {activeTab === "students" && (
              <StudentList 
                students={listStudent}
                onStudentClick={setSelectedStudent}
                showActions={userRole === ROLE.TEACHER}
              />
            )}
            {activeTab === "attendance" && (
              <AttendanceHistory
                students={listStudent}
                title={userRole === ROLE.TEACHER ? "Lịch sử điểm danh lớp" : "Điểm danh của tôi"}
              />
            )}
            {activeTab === "grades" && (
              <div className="space-y-6">
                <GradeFilters
                  onFilterChange={(filters) => setGradeFilters(prev => ({ ...prev, ...filters }))}
                  onReset={() => setGradeFilters({})}
                  loading={gradesLoading}
                />
                {gradesLoading ? (
                  <LoadingState type="grades" />
                ) : (
                  <GradeList
                    grades={grades}
                    loading={false}
                    onEdit={(grade) => {
                      setSelectedGrade(grade);
                      setGradeModalMode('edit');
                      setShowGradeModal(true);
                    }}
                    onDelete={deleteGrade}
                    onView={(grade) => {
                      setSelectedGrade(grade);
                      setGradeModalMode('view');
                      setShowGradeModal(true);
                    }}
                    showActions={userRole === ROLE.TEACHER || userRole === ROLE.ADMIN}
                    showStudent={true}
                  />
                )}
              </div>
            )}
            {activeTab === "statistics" && (
              <GradeStatistics
                statistics={statistics}
                loading={statisticsLoading}
              />
            )}
            {activeTab === "qr" && (
              <QRHistoryList qrHistory={qrHistory} onSelect={setSelectedQR} />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QRGenerator 
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
        classId={classData._id || classData.id}
      />
   
      <StudentDetailModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
      />

      <QRDetailModal 
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        qr={selectedQR}
      />

      <ManualAttendanceModal
        isOpen={showManualAttendance}
        onClose={() => setShowManualAttendance(false)}
        classId={classData._id || classData.id}
        students={listStudent}
        userRole={userRole}
        onSuccess={refreshClassData}
      />

      <GradeFormModal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedGrade(undefined);
        }}
        classId={classData._id || classData.id}
        students={listStudent}
        classData={classData}
        grade={selectedGrade}
        mode={gradeModalMode}
        onUpdateComponent={updateGrade}
        onCalculateFinal={calculateFinalGrade}
        onDelete={deleteGrade}
        onSuccess={() => {
          fetchGrades();
          refreshClassData();
        }}
      />
    </div>
  );
};

export default ClassDetailView;