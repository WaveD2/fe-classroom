import React, { useState, useEffect, memo } from 'react';
import { 
  X, 
  Save, 
  Award, 
  User, 
  AlertCircle,
} from 'lucide-react';
import { GradeData, User as UserType, ClassI } from '../../types';
import Button from '../common/Button';

interface GradeFormNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GradeData) => void;
  onCancel: () => void;
  initialData?: GradeData;
  classData?: ClassI;
  students?: UserType[];
  student?: UserType;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const GradeFormNew = memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onCancel,
  initialData,
  classData,
  students = [],
  student,
  loading = false,
  mode = 'create'
}: GradeFormNewProps) => {
  const [formData, setFormData] = useState<GradeData>({
    attendance: 0,
    homework: 0,
    midterm: 0,
    final: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          attendance: 0,
          homework: 0,
          midterm: 0,
          final: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate scores (0-10)
    const scores = [
      { key: 'attendance', value: formData.attendance, label: 'Chuyên cần' },
      { key: 'homework', value: formData.homework, label: 'Bài tập' },
      { key: 'midterm', value: formData.midterm, label: 'Giữa kỳ' },
      { key: 'final', value: formData.final, label: 'Cuối kỳ' }
    ];

    scores.forEach(({ key, value, label }) => {
      if (Number(value) < 0 || Number(value) > 10) {
        newErrors[key] = `${label} phải từ 0 đến 10`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof GradeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'create' ? 'Nhập điểm cho học sinh' : 'Chỉnh sửa điểm'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {classData?.name || 'Lớp học'} • {student?.name || 'Chọn học sinh'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student Selection (only for create mode) */}
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Học sinh *
                </label>
                <select
                  value={student?._id || student?.id || ''}
                  // onChange={(e) => {
                  //   const selectedStudent = students.find(s => (s._id || s.id) === e.target.value);
                  //   // This would need to be handled by parent component
                  // }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Chọn học sinh</option>
                  {students.map((student) => (
                    <option key={student._id || student.id} value={student._id || student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Grade Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên cần (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.attendance}
                  onChange={(e) => handleChange('attendance', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.attendance ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.attendance && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.attendance}
                  </p>
                )}
              </div>

              {/* Homework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bài tập (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.homework}
                  onChange={(e) => handleChange('homework', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.homework ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.homework && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.homework}
                  </p>
                )}
              </div>

              {/* Midterm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giữa kỳ (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.midterm}
                  onChange={(e) => handleChange('midterm', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.midterm ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.midterm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.midterm}
                  </p>
                )}
              </div>

              {/* Final */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuối kỳ (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.final}
                  onChange={(e) => handleChange('final', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.final ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.final && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.final}
                  </p>
                )}
              </div>
            </div>


            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {mode === 'create' ? 'Lưu điểm' : 'Cập nhật'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

GradeFormNew.displayName = 'GradeFormNew';

export default GradeFormNew;
