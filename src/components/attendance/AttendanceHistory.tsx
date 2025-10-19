// AttendanceHistory.tsx
import { useState, useMemo } from "react";
import { Calendar, User, Clock, TrendingUp } from "lucide-react";
import { StudentWithAttendance } from "../../types";

const AttendanceHistory = ({
  students = [],
  title,
}: {
  students: StudentWithAttendance[];
  title: string;
}) => {
  const [filterDate, setFilterDate] = useState<string>(() => {
    // format yyyy-MM-dd để tương thích input[type="date"]
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  
  // Transform students data into attendance records for filtering
  const attendanceRecords = useMemo(() => {
    const records: Array<{
      id: string;
      studentId: string;
      studentName: string;
      studentEmail: string;
      attendanceTime: string;
      attendanceCount: number;
      attendanceRate: number;
    }> = [];
    
    students.forEach(student => {
      student.attendanceTimes.forEach(time => {
        records.push({
          id: `${student._id}-${time}`,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          attendanceTime: time,
          attendanceCount: student.attendanceCount,
          attendanceRate: student.attendanceRate,
        });
      });
    });
    
    return records.sort((a, b) => new Date(b.attendanceTime).getTime() - new Date(a.attendanceTime).getTime());
  }, [students]);
  
  const filteredData = filterDate
    ? attendanceRecords.filter(
        (item) =>
          new Date(item.attendanceTime).toLocaleDateString("vi-VN") ===
          new Date(filterDate).toLocaleDateString("vi-VN")
      )
    : attendanceRecords;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-xl font-bold">{title}</h3>

        <div className="relative w-full sm:w-60">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Tổng học sinh</p>
                <p className="text-2xl font-bold text-blue-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Tổng lượt điểm danh</p>
                <p className="text-2xl font-bold text-green-900">
                  {students.length ? students[0]?.attendanceTotal : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Tổng số điểm danh</p>
                <p className="text-2xl font-bold text-purple-900">
                    {students.reduce((sum, student) => sum + student.attendanceCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Calendar className="mb-2 h-6 w-6" />
            <p className="text-sm">Không có dữ liệu điểm danh</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredData.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{item.studentName}</p>
                      <p className="text-sm text-gray-500 truncate">{item.studentEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
                  <span className="text-sm text-gray-600">
                    {new Date(item.attendanceTime).toLocaleString("vi-VN")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
