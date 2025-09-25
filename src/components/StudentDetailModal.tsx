import AttendanceHistory from "./AttendanceHistory";
import Modal from "./Modal";

const StudentDetailModal = ({ isOpen, onClose, student }: {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}) => {
  const attendanceFromStudent = Array.isArray(student?.attendanceTimes)
    ? student.attendanceTimes.map((t: string) => ({
        createdAt: t,
        user: { email: student?.email }
      }))
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết học sinh">
      {student && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || "S")}\u0026background=random\u0026size=96`}
              alt="avatar"
              className="w-16 h-16 rounded-full border flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-lg break-words">{student.name}</h3>
              <p className="text-gray-600 break-all text-sm">{student.email}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{student.attendanceCount ?? 0}</div>
                  <div className="text-xs text-gray-500">Số lần điểm danh</div>
                </div>
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{student.attendanceRate ?? 0}%</div>
                  <div className="text-xs text-gray-500">Tỷ lệ điểm danh</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <AttendanceHistory attendance={attendanceFromStudent as any} title="Lịch sử điểm danh" />
        </div>
      )}
    </Modal>
  );
};

export default StudentDetailModal;  