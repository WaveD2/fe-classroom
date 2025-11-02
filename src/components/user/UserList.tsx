import { memo } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Eye,
  Phone
} from 'lucide-react';
import { User as UserType, ROLE } from '../../types';

interface UserListProps {
  users: UserType[];
  role: ROLE.TEACHER | ROLE.STUDENT;
  onViewUser: (user: UserType) => void;
}

const UserList = memo(({ users, role, onViewUser }: UserListProps) => {
  const isTeacher = role === ROLE.TEACHER;
  const roleLabel = isTeacher ? 'Giáo viên' : 'Học sinh';
  const roleIcon = isTeacher ? GraduationCap : User;
  const RoleIcon = roleIcon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {roleLabel}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {isTeacher ? 'Mã giáo viên' : 'Mã học sinh'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Số điện thoại
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
            {users.map((userItem, index) => (
              <tr 
                key={userItem.id || userItem._id} 
                className="hover:bg-gray-50 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r rounded-lg flex items-center justify-center ${
                      isTeacher 
                        ? 'from-blue-100 to-indigo-100' 
                        : 'from-green-100 to-blue-100'
                    }`}>
                      <RoleIcon className={`w-5 h-5 ${isTeacher ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {userItem.name}
                      </div>
                      {userItem.email && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {userItem.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate max-w-xs">{userItem.email || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {isTeacher 
                      ? (userItem.teacherId || userItem.id || userItem._id)
                      : (userItem.studentId || userItem.id || userItem._id)
                    }
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    {userItem.phone ? (
                      <>
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{userItem.phone}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    userItem.status === 'active' || !userItem.status
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userItem.status === 'active' || !userItem.status ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewUser(userItem)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group-hover:scale-110"
                      title={`Xem chi tiết ${roleLabel.toLowerCase()}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <RoleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy {roleLabel.toLowerCase()}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Chưa có {roleLabel.toLowerCase()} nào trong hệ thống
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

UserList.displayName = 'UserList';

export default UserList;
