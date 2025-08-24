// AttendanceHistory.tsx
import { useState } from "react";
import { Calendar } from "lucide-react";
import { HistoryAttendance } from "../types";

const AttendanceHistory = ({
  attendance = [],
  title,
}: {
  attendance: HistoryAttendance[];
  title: string;
}) => {
  const [filterDate, setFilterDate] = useState<string>("");

  const filteredData = filterDate
    ? attendance.filter(
        (item) =>
          new Date(String(item.createdAt)).toLocaleDateString("vi-VN") ===
          new Date(filterDate).toLocaleDateString("vi-VN")
      )
    : attendance;

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

      {/* List */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Calendar className="mb-2 h-6 w-6" />
            <p className="text-sm">Không có dữ liệu</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredData.map((item, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
              >
                {/* Thời gian */}
                <span className="text-gray-600">
                  {new Date(String(item?.createdAt)).toLocaleString("vi-VN")}
                </span>

                {/* User */}
                {
                  item?.user?.email &&
                  <span
                  className={`mt-1 sm:mt-0 font-medium break-all ${
                    item?.user ? "text-green-600" : "text-gray-500"
                  }`}
                    >
                      {item?.user?.email}
                    </span>
                }
                
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
