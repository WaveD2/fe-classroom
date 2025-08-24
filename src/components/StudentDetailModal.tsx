import AttendanceHistory from "./AttendanceHistory";
import Modal from "./Modal";

const StudentDetailModal = ({ isOpen, onClose, student, attendance }: {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    attendance: any;
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết học sinhs">
      {student && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-600">
                {student.name.charAt(0)}
              </span>
            </div>
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-gray-600">{student.email}</p>
            <p className="text-sm text-blue-600 mt-1">Tỷ lệ điểm danh: {student.attendanceRate}%</p>
          </div>
          <AttendanceHistory attendance={attendance} title="Lịch sử điểm danh" />
        </div>
      )}
    </Modal>
  );
  
  export default StudentDetailModal;  