import { Eye, Clock, TrendingUp } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { ROLE, User, StudentWithAttendance } from "../types";

const StudentList = ({ students, onStudentClick, showActions = false }: {
    students: StudentWithAttendance[];
    onStudentClick: (student: User) => void;
    showActions?: boolean;
}) => (
    <div className="space-y-2">
      {students.filter(student=> student.role ===ROLE.STUDENT).map(student => (
        <Card key={student._id || student.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{student.name}</p>
                <p className="text-sm text-gray-600 truncate">{student.email}</p>
                
                {/* Attendance Stats */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {student.attendanceCount} lần điểm danh
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {student.attendanceRate}% tỷ lệ
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {showActions && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onStudentClick(student)}
                >
                  <Eye size={16} />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  export default StudentList;