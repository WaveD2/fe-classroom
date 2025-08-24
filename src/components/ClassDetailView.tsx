import { useState, useEffect } from 'react';
import Button from './Button';
import { QrCode, Users, Clock, History } from 'lucide-react'; 
import QRGenerator from './QRGenerator';
import StudentList from './StudentList';
import AttendanceHistory from './AttendanceHistory';
import QRHistoryList from './QRHistoryList';
import StudentDetailModal from './StudentDetailModal';
import QRDetailModal from './QRDetailModal';
import { ROLE } from '../types';
import type { ClassI, User, HistoryAttendance, QrHistoryI } from '../types'; 
import { getAllQR } from '../api/qr';
import { getClassDetail } from '../api/class';

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

  useEffect(() => {

    const fetchClass = async () => {
      try {
        const response = await getClassDetail(classData._id || classData.id);
        if (response?.data) {
          setListStudent(response.data.students);
          setHistoryAttendance(response.data.historyJoin);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
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
  }, [activeTab]);

  return (
    <div className="w-full space-y-6 p-2 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center text-sm transition-colors"
          >
            ← Quay lại
          </button>
          <h2 className="text-2xl font-bold truncate">{classData.name}</h2>
          <p className="text-gray-600 text-sm">Mã lớp: {classData.uniqueCode}</p>
        </div>
  
        {userRole === ROLE.TEACHER && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowQRGenerator(true)} 
              className="flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <QrCode className="w-5 h-5" />
              <span>Tạo mã QR</span>
            </Button>
          </div>
        )}
      </div>
  
      <div className="flex justify-around">
        {[
          { key: "students", label: "Học sinh", icon: Users },
          { key: "attendance", label: "Điểm danh", icon: Clock },
          ...(userRole === ROLE.TEACHER ? [{ key: "qr", label: "Lịch sử QR", icon: History }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 px-3 py-2 font-medium text-sm transition-colors relative
              ${activeTab === tab.key 
                ? "text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-slideIn" />
            )}
          </button>
        ))}
      </div>
  
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