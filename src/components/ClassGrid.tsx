import { Calendar, Users } from "lucide-react";
import Card from "./Card";
import { ClassI } from "../types";

const ClassGrid = ({ classes, onClassClick }: { classes: ClassI[]; onClassClick: (classItem: any) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map(classItem => (
        <Card key={classItem._id || classItem.id} onClick={() => onClassClick(classItem)} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{classItem.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {classItem.uniqueCode}
            </span>
          </div>
          {classItem.teacher && <p className="text-gray-600 text-sm mb-3">Giáo viên: {classItem.teacher.name}</p> }
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              {classItem.countStudent} thành viên
            </span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {new Date(String(classItem.createdAt)).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );

  export default ClassGrid;