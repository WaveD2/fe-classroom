import React, { useState, useEffect, useCallback } from 'react';
import { X, Users, UserPlus, Trash2, Eye, Search, GraduationCap, User as UserIcon, Check } from 'lucide-react';
import { User, ClassI, PaginationInfo } from '../../types';
import { getClassStudents, addMultipleStudentsToClass, removeStudentFromClass, addTeacherToClass } from '../../api/class';
import { getStudents, getTeachers } from '../../api/user';
import StudentDetailModal from '../user/StudentDetailModal';
import { showError, showSuccess } from '../Toast';

interface ClassMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassI;
  onRefresh: () => void;
  onStudentClick?: (student: User) => void;
  onTeacherClick?: (teacher: User) => void;
}

const ClassMembersModal: React.FC<ClassMembersModalProps> = ({
  isOpen,
  onClose,
  classData,
  onRefresh,
  onStudentClick,
  onTeacherClick
}) => {
  const [classStudents, setClassStudents] = useState<User[]>([]);
  const [classTeachers, setClassTeachers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const fetchClassMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getClassStudents(classData.id || classData._id, {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined
      });
      if (response?.data) {
        setClassStudents(response.data.students || []);
        setPagination(prev => response.data.pagination || prev);
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
      showError('Có lỗi xảy ra khi tải danh sách học sinh trong lớp');
    } finally {
      setLoading(false);
    }
  }, [classData.id, classData._id, pagination.page, pagination.limit, search]);

  const fetchAllStudents = useCallback(async () => {
    try {
      const response = await getStudents({ limit: 1000 });
      if (response?.data) {
        setAllStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
    }
  }, []);

  const fetchAllTeachers = useCallback(async () => {
    try {
      const response = await getTeachers({ limit: 1000 });
      if (response?.data) {
        setAllTeachers(response.data);
      }
    } catch (error) {
      console.error('Error fetching all teachers:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchClassMembers();
      fetchAllStudents();
      fetchAllTeachers();
      // Set class teachers from classData
      if (classData.teacher) {
        setClassTeachers([classData.teacher]);
      } else {
        setClassTeachers([]);
      }
    }
  }, [isOpen, fetchClassMembers, fetchAllStudents, fetchAllTeachers, classData.teacher]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [activeTab]);

  const handleAddSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      const userIds = selectedUsers.map(u => u.id || u._id);
      if (activeTab === 'students') {
        await addMultipleStudentsToClass(classData.id || classData._id, userIds);
        showSuccess(`Thêm ${selectedUsers.length} học sinh thành công`);
      } else {
        for (const teacher of selectedUsers) {
          await addTeacherToClass(classData.id || classData._id, teacher.id || teacher._id);
        }
        showSuccess(`Thêm ${selectedUsers.length} giáo viên thành công`);
      }
      setSelectedUsers([]);
      await fetchClassMembers();
      onRefresh();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await removeStudentFromClass(classData.id || classData._id, studentId);
      showSuccess('Xóa học sinh khỏi lớp thành công');
      await fetchClassMembers();
      onRefresh();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh');
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => (u.id || u._id) === (user.id || user._id));
      if (isSelected) {
        return prev.filter(u => (u.id || u._id) !== (user.id || user._id));
      } else {
        return [...prev, user];
      }
    });
  };

  const isUserInClass = (user: User) => {
    const classMembers = activeTab === 'students' ? classStudents : classTeachers;
    return classMembers.some(member => (member.id || member._id) === (user.id || user._id));
  };

  const getAvailableUsers = () => {
    const allUsers = activeTab === 'students' ? allStudents : allTeachers;
    return allUsers.filter(user => !isUserInClass(user));
  };

  const getFilteredUsers = () => {
    const availableUsers = getAvailableUsers();
    if (!search.trim()) return availableUsers;
    return availableUsers.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl animate-fadeIn max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quản lý thành viên lớp</h2>
                  <p className="text-blue-100">{classData.name}</p>
                  <p className="text-sm text-blue-200">Mã lớp: {classData.uniqueCode}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6">
              <div className="space-y-6">
                {/* Tabs */}
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'students'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="font-medium">Học sinh</span>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                      activeTab === 'students' ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {classStudents.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('teachers')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'teachers'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">Giáo viên</span>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                      activeTab === 'teachers' ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {classTeachers.length}
                    </span>
                  </button>
                </div>

                {/* Add Users Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Thêm {activeTab === 'students' ? 'học sinh' : 'giáo viên'}
                  </h3>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Tìm kiếm ${activeTab === 'students' ? 'học sinh' : 'giáo viên'}...`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleAddSelectedUsers}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <UserPlus className="w-4 h-4" />
                          Thêm {selectedUsers.length}
                        </button>
                        <button
                          onClick={() => setSelectedUsers([])}
                          className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Available Users List */}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {getFilteredUsers().map((user) => (
                      <div
                        key={user.id || user._id}
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedUsers.some(u => (u.id || u._id) === (user.id || user._id))
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`}
                          alt="avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {selectedUsers.some(u => (u.id || u._id) === (user.id || user._id)) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                    {getFilteredUsers().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Không có {activeTab === 'students' ? 'học sinh' : 'giáo viên'} nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {(activeTab === 'students' ? classStudents : classTeachers).map((user) => (
                      <div
                        key={user.id || user._id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=48`}
                            alt="avatar"
                            className="w-12 h-12 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              if (activeTab === 'students' && onStudentClick) {
                                onStudentClick(user);
                              } else if (activeTab === 'teachers' && onTeacherClick) {
                                onTeacherClick(user);
                              }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {activeTab === 'students' && (
                            <button
                              onClick={() => handleRemoveStudent(user.id || user._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Xóa khỏi lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(activeTab === 'students' ? classStudents : classTeachers).length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          {activeTab === 'students' ? (
                            <UserIcon className="w-10 h-10 text-gray-400" />
                          ) : (
                            <GraduationCap className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Chưa có {activeTab === 'students' ? 'học sinh' : 'giáo viên'} nào
                        </h3>
                        <p className="text-gray-600">
                          Chọn {activeTab === 'students' ? 'học sinh' : 'giáo viên'} từ danh sách bên trái để thêm vào lớp
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
      />
    </>
  );
};

export default ClassMembersModal;
