import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Calendar, Shield, Edit3, Save, XCircle } from 'lucide-react';
import { User as UserType, ROLE } from '../types';
import { showSuccess, showError } from './Toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateProfile?: (userData: Partial<UserType>) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email
      });
      setIsEditing(false);
    }
  }, [isOpen, user]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!onUpdateProfile) {
      showError('Chức năng cập nhật chưa được hỗ trợ');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
      showSuccess('Cập nhật thông tin thành công');
    } catch (error) {
      showError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email
    });
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case ROLE.TEACHER:
        return 'Giáo viên';
      case ROLE.ADMIN:
        return 'Quản trị viên';
      case ROLE.STUDENT:
        return 'Học sinh';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLE.TEACHER:
        return 'bg-blue-100 text-blue-800';
      case ROLE.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case ROLE.STUDENT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
              <p className="text-sm text-gray-500">Xem và chỉnh sửa thông tin tài khoản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${user.name.replace(" ", "+")}&background=random&size=120`}
                alt="Avatar"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-sm text-gray-500">
                Tham gia từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Nhập email"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.email}
                </div>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Vai trò
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>

            {/* Join Date Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày tham gia
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              {onUpdateProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
