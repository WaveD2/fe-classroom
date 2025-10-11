import { useState } from 'react';
import { GRADE_TYPE, CreateGradeRequest, UpdateGradeRequest, User } from '../types';
import Button from './Button';
import { useGradeForm } from '../hook/useGrade';

interface GradeFormProps {
  classId: string;
  students: User[];
  onSuccess: () => void;
  onCancel: () => void;
  editGrade?: {
    id: string;
    studentId: string;
    gradeType: GRADE_TYPE;
    gradeName: string;
    maxScore: number;
    actualScore: number;
    description?: string;
  };
}

const GradeForm = ({ classId, students, onSuccess, onCancel, editGrade }: GradeFormProps) => {
  const [formData, setFormData] = useState({
    studentId: editGrade?.studentId || '',
    gradeType: editGrade?.gradeType || GRADE_TYPE.ASSIGNMENT,
    gradeName: editGrade?.gradeName || '',
    maxScore: editGrade?.maxScore || 100,
    actualScore: editGrade?.actualScore || 0,
    description: editGrade?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createGrade, updateGrade, loading, error } = useGradeForm();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Vui lòng chọn học sinh';
    }
    if (!formData.gradeName.trim()) {
      newErrors.gradeName = 'Vui lòng nhập tên điểm';
    }
    if (formData.maxScore <= 0) {
      newErrors.maxScore = 'Điểm tối đa phải lớn hơn 0';
    }
    if (formData.actualScore < 0) {
      newErrors.actualScore = 'Điểm thực tế không thể âm';
    }
    if (formData.actualScore > formData.maxScore) {
      newErrors.actualScore = 'Điểm thực tế không thể lớn hơn điểm tối đa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editGrade) {
        const updateData: UpdateGradeRequest = {
          actualScore: formData.actualScore,
          description: formData.description
        };
        await updateGrade(editGrade.id, updateData);
      } else {
        const gradeData: CreateGradeRequest = {
          classId,
          studentId: formData.studentId,
          gradeType: formData.gradeType,
          gradeName: formData.gradeName,
          maxScore: formData.maxScore,
          actualScore: formData.actualScore,
          description: formData.description
        };
        await createGrade(gradeData);
      }
      onSuccess();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const percentage = formData.maxScore > 0 ? Math.round((formData.actualScore / formData.maxScore) * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!editGrade && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Học sinh *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => handleInputChange('studentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn học sinh</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại điểm *
            </label>
            <select
              value={formData.gradeType}
              onChange={(e) => handleInputChange('gradeType', e.target.value as GRADE_TYPE)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(GRADE_TYPE).map(type => (
                <option key={type} value={type}>
                  {type === GRADE_TYPE.ASSIGNMENT && 'Bài tập'}
                  {type === GRADE_TYPE.QUIZ && 'Kiểm tra'}
                  {type === GRADE_TYPE.PROJECT && 'Dự án'}
                  {type === GRADE_TYPE.PARTICIPATION && 'Tham gia'}
                  {type === GRADE_TYPE.HOMEWORK && 'Bài về nhà'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên điểm *
            </label>
            <input
              type="text"
              value={formData.gradeName}
              onChange={(e) => handleInputChange('gradeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: Bài tập 1, Kiểm tra giữa kỳ..."
            />
            {errors.gradeName && (
              <p className="text-red-500 text-sm mt-1">{errors.gradeName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm tối đa *
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e) => handleInputChange('maxScore', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.maxScore && (
              <p className="text-red-500 text-sm mt-1">{errors.maxScore}</p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Điểm thực tế *
        </label>
        <input
          type="number"
          min="0"
          max={formData.maxScore}
          value={formData.actualScore}
          onChange={(e) => handleInputChange('actualScore', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.actualScore && (
          <p className="text-red-500 text-sm mt-1">{errors.actualScore}</p>
        )}
        {formData.maxScore > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Phần trăm: {percentage}%
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Mô tả thêm về điểm này..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : editGrade ? 'Cập nhật' : 'Tạo điểm'}
        </Button>
      </div>
    </form>
  );
};

export default GradeForm;
