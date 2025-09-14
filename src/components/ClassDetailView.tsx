import { useState, useEffect } from 'react';
import Button from './Button';
import { QrCode, Users, Clock, History, Download, ArrowLeft, Calendar, BookOpen, GraduationCap } from 'lucide-react'; 
import QRGenerator from './QRGenerator';
import StudentList from './StudentList';
import AttendanceHistory from './AttendanceHistory';
import QRHistoryList from './QRHistoryList';
import StudentDetailModal from './StudentDetailModal';
import QRDetailModal from './QRDetailModal';
import { ROLE, STATUS_CLASS } from '../types';
import type { ClassI, User, HistoryAttendance, QrHistoryI } from '../types'; 
import { getAllQR } from '../api/qr';
import { exportAttendanceClass, getClassDetail } from '../api/class';

const ClassDetailView = ({ classData, userRole, onBack }: {
  classData: ClassI;
  userRole: string;
  onBack: () => void;
}) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [listStudent, setListStudent] = useState<User[]>([]);
  const [historyAttendance, setHistoryAttendance] = useState<HistoryAttendance[]>([]);
  const [qrHistory, setQrHistory] = useState<QrHistoryI[]>([]);
  const [activeTab, setActiveTab] = useState("students");
  const [selectedQR, setSelectedQR] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teacher, setTeacher] = useState<User | null>(null);

  useEffect(() => {

    const fetchClass = async () => {
      setIsLoading(true);
      try {
        const response = await getClassDetail(classData._id || classData.id);
        if (response?.data) {
          setListStudent(response.data.students);
          setHistoryAttendance(response.data.historyJoin);
          // Find teacher for admin view
          const teacherData = response.data.students?.find((item: User) => item.role === ROLE.TEACHER);
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

      default:
        break;
    }
  }, [activeTab, classData._id, classData.id, userRole]);
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="py-4">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>

          {/* Class Info */}
          <div className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Class Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                        {classData.name}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          classData.status === STATUS_CLASS.OPEN 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classData.status === STATUS_CLASS.OPEN ? 'Đang học' : 'Đã đóng'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {classData.studentCount || listStudent.length} học sinh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Code */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Mã lớp: <span className="font-mono font-medium">{classData.uniqueCode}</span></span>
                </div>

                {/* Teacher Info for Admin */}
                {userRole === ROLE.ADMIN && teacher && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Giáo viên phụ trách</p>
                        <p className="text-lg font-semibold text-blue-900">{teacher.name}</p>
                        <p className="text-sm text-blue-700">{teacher.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {userRole === ROLE.TEACHER && (
                <div className="flex flex-col sm:flex-row gap-3">
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
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Xuất dữ liệu</span>
                  </Button>
                  <Button 
                    onClick={() => setShowQRGenerator(true)} 
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="font-medium">Tạo mã QR</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { key: "students", label: "Học sinh", icon: Users },
              { key: "attendance", label: "Điểm danh", icon: Clock },
              ...(userRole === ROLE.TEACHER ? [{ key: "qr", label: "Lịch sử QR", icon: History }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
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
                attendance={historyAttendance}
                title={userRole === ROLE.TEACHER ? "Lịch sử điểm danh lớp" : "Điểm danh của tôi"}
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
        attendance={[]}
      />

      <QRDetailModal 
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        qr={selectedQR}
      />
    </div>
  );
};

export default ClassDetailView;