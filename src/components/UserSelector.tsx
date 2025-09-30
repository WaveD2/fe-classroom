import React, { useState, useEffect } from 'react';
import { Search} from 'lucide-react';
import { User, ROLE } from '../types';
import { getStudents, getTeachers } from '../api/user';

interface UserSelectorProps {
  role: ROLE.STUDENT | ROLE.TEACHER;
  selectedUsers: User[];
  onSelect: (user: User) => void;
  onRemove: (userId: string) => void;
  placeholder?: string;
  className?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  role,
  selectedUsers,
  onSelect,
  placeholder = "Tìm kiếm người dùng...",
  className = ""
}) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchUsers = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = role === ROLE.STUDENT 
        ? await getStudents({ search: search.trim(), limit: 20 })
        : await getTeachers({ search: search.trim(), limit: 20 });
      
      if (response?.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [search, role]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setSearch('');
    setShowDropdown(false);
  };

  const isSelected = (userId: string) => {
    return selectedUsers.some(u => u.id === userId || u._id === userId);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.id || user._id}
                  onClick={() => handleSelect(user)}
                  disabled={isSelected(user.id || user._id)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 ${
                    isSelected(user.id || user._id) 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'text-gray-900'
                  }`}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {isSelected(user.id || user._id) && (
                    <span className="text-xs text-blue-600">Đã chọn</span>
                  )}
                </button>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              Không tìm thấy {role === ROLE.STUDENT ? 'học sinh' : 'giáo viên'} nào
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              Nhập tên hoặc email để tìm kiếm
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserSelector;
