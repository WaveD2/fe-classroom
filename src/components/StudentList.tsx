import { Eye } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { User } from "../types";

const StudentList = ({ students, onStudentClick, showActions = false }: {
    students: User[];
    onStudentClick: (student: User) => void;
    showActions?: boolean;
}) => (
    <div className="space-y-2">
      {students.map(student => (
        <Card key={student.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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