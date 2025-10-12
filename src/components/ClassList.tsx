import  { memo } from 'react';
import { 
  Users, 
  GraduationCap, 
  Eye, 
  Trash2,
  BookOpen
} from 'lucide-react';
import { ClassI } from '../types';

interface ClassListProps {
  classes: ClassI[];
  onManageClass: (classItem: ClassI) => void;
  onDeleteClass: (classId: string) => void;
  onViewTeacher: (teacher: any) => void;
}

const ClassList = memo(({ classes, onManageClass, onDeleteClass, onViewTeacher }: ClassListProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Lớp học
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã lớp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Giáo viên
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Học sinh
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {classes.map((classItem, index) => (
              <tr 
                key={classItem.id || classItem._id} 
                className="hover:bg-gray-50 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {classItem.name}
                      </div>
                      {classItem.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {classItem.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {classItem.uniqueCode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className={`text-sm ${classItem.teacher ? 'text-gray-900 cursor-pointer hover:text-purple-600 transition-colors' : 'text-gray-500'}`}
                    onClick={() => {
                      if (classItem.teacher) {
                        onViewTeacher(classItem.teacher);
                      }
                    }}
                  >
                    {classItem.teacher ? (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {classItem.teacher.name}
                      </div>
                    ) : (
                      'Chưa có'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{classItem.studentCount || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    classItem.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {classItem.status === 'open' ? 'Hoạt động' : 'Đã đóng'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onManageClass(classItem)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group-hover:scale-110"
                      title="Quản lý lớp"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClass(classItem.id || classItem._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:scale-110"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ClassList.displayName = 'ClassList';

export default ClassList;


