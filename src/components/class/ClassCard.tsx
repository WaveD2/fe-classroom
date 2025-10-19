import { memo } from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar, 
  Eye,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { ClassI } from '../../types';

interface ClassCardProps {
  classItem: ClassI;
  index: number;
  onManageClass: (classItem: ClassI) => void;
  onDeleteClass: (classItem: ClassI) => void;
  onViewTeacher: (teacher: any) => void;
}

const ClassCard = memo(({ 
  classItem, 
  index, 
  onManageClass, 
  onDeleteClass, 
  onViewTeacher 
}: ClassCardProps) => {
  const handleManageClick = () => {
    onManageClass(classItem);
  };

  const handleDeleteClick = () => {
    onDeleteClass(classItem);
  };

  const handleTeacherClick = () => {
    if (classItem.teacher) {
      onViewTeacher(classItem.teacher);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-purple-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{classItem.name}</h3>
              <p className="text-purple-100 text-sm">Lớp học</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            classItem.status === 'open' 
              ? 'bg-green-500/20 text-green-100' 
              : 'bg-red-500/20 text-red-100'
          }`}>
            {classItem.status === 'open' ? 'Hoạt động' : 'Đã đóng'}
          </div>
        </div>
        <p className="text-purple-100 text-sm">
          Mã: <span className="font-mono font-medium">{classItem.uniqueCode}</span>
        </p>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="space-y-3 min-h-24">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">{classItem.studentCount || 0} học sinh</p>
          </div>
          
          {classItem.teacher && (
            <div 
              className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors"
              onClick={handleTeacherClick}
            >
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 truncate">{classItem.teacher.name}</p>
            </div>
          )}
          
          {classItem.description && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 line-clamp-2">{classItem.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={handleManageClick}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium group-hover:translate-x-1 transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Quản lý lớp
              <ArrowRight className="w-3 h-3" />
            </button>
            <div className="flex gap-1">
              <button
                onClick={handleManageClick}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Quản lý"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa lớp"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ClassCard.displayName = 'ClassCard';

export default ClassCard;


