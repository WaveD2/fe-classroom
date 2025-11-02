import React, { useState, useEffect } from 'react';
import { X, BookOpen, User as UserIcon } from 'lucide-react';
import { getTeachers } from '../../api/user';
import { User } from '../../types';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; teacherId: string; code?: string, academicCredit: number }) => Promise<void>;
  initialData?: { name: string; description: string; teacherId: string; code?: string , academicCredit: number};
  title?: string;
}

const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = { name: '', description: '', teacherId: '', code: '',  academicCredit: 0 },
  title = "Tạo lớp học mới"
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; teacherId?: string, academicCredit?:string }>({});

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await getTeachers({ limit: 100 });
      if (response?.data) {
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; teacherId?: string; academicCredit?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp học là bắt buộc';
    }
    if (!formData.teacherId) {
      newErrors.teacherId = 'Vui lòng chọn giáo viên phụ trách';
    }
    if (!formData.academicCredit || formData.academicCredit <= 0) {
      newErrors.academicCredit = 'Vui lòng nhập số tín chỉ hợp lệ';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '', teacherId: '', code: '' , academicCredit: 0});
      onClose();
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <form id="class-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên lớp học *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên lớp học"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-base ${
                errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
              Giáo viên phụ trách *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-base appearance-none bg-white ${
                  errors.teacherId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn giáo viên phụ trách</option>
                {loadingTeachers ? (
                  <option disabled>Đang tải danh sách giáo viên...</option>
                ) : (
                  teachers.map((teacher) => (
                    <option key={teacher.id || teacher._id} value={teacher.id || teacher._id}>
                      {teacher.name} - {teacher.email}
                    </option>
                  ))
                )}
              </select>
            </div>
            {errors.teacherId && (
              <p className="mt-1.5 text-sm text-red-600">{errors.teacherId}</p>
            )}
          </div>

          <div>
            <label htmlFor="academicCredit" className="block text-sm font-medium text-gray-700 mb-2">
              Số tín chỉ *
            </label>
            <input
              id="academicCredit"
              type="number"
              name="academicCredit"
              value={formData.academicCredit}
              onChange={handleInputChange}
              placeholder="Nhập số tín chỉ lớp học"
              min="0"
              step="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-base ${
                errors.academicCredit ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.academicCredit && (
              <p className="mt-1.5 text-sm text-red-600">{errors.academicCredit}</p>
            )}
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Mã lớp (tùy chọn)
            </label>
            <input
              id="code"
              type="text"
              name="code"
              value={formData.code || ''}
              onChange={handleInputChange}
              placeholder="Nhập mã lớp tùy chỉnh"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-base"
            />
            <p className="mt-1.5 text-xs text-gray-500">Để trống để tự động tạo mã</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả lớp học (tùy chọn)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-base"
            />
          </div>

        </form>

        {/* Actions - Fixed footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
            disabled={loading || loadingTeachers}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tạo...</span>
              </div>
            ) : (
              'Tạo lớp'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassFormModal;
