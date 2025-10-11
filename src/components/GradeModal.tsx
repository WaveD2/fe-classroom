import { useState } from 'react';
import { Grade, User, GRADE_TYPE } from '../types';
import Modal from './Modal';
import GradeForm from './GradeForm';
import Button from './Button';
import { Edit, Trash2, X } from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  students: User[];
  grade?: Grade;
  onSuccess: () => void;
  onDelete?: (gradeId: string) => void;
}

const GradeModal = ({ 
  isOpen, 
  onClose, 
  classId, 
  students, 
  grade, 
  onSuccess,
  onDelete 
}: GradeModalProps) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');

  const handleSuccess = () => {
    onSuccess();
    setMode('view');
    onClose();
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleDelete = () => {
    if (grade && onDelete) {
      onDelete(grade._id);
      onClose();
    }
  };

  const getGradeTypeLabel = (type: GRADE_TYPE) => {
    const labels = {
      [GRADE_TYPE.ASSIGNMENT]: 'Bài tập',
      [GRADE_TYPE.QUIZ]: 'Kiểm tra',
      [GRADE_TYPE.EXAM]: 'Thi',
      [GRADE_TYPE.PROJECT]: 'Dự án',
      [GRADE_TYPE.PARTICIPATION]: 'Tham gia',
      [GRADE_TYPE.HOMEWORK]: 'Bài về nhà'
    };
    return labels[type];
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeStatus = (percentage: number) => {
    if (percentage >= 90) return 'Xuất sắc';
    if (percentage >= 80) return 'Giỏi';
    if (percentage >= 70) return 'Khá';
    if (percentage >= 60) return 'Trung bình';
    return 'Yếu';
  };

  const renderViewMode = () => {
    if (!grade) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getGradeTypeLabel(grade.gradeType)}
            </span>
            <h3 className="text-xl font-semibold text-gray-900">
              {grade.gradeName}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEdit}
            >
              <Edit size={16} className="mr-1" />
              Chỉnh sửa
            </Button>
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-1" />
                Xóa
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Học sinh
            </label>
            <p className="text-sm text-gray-900">
              {grade.student?.name || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">
              {grade.student?.email || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm thực tế
            </label>
            <p className="text-2xl font-bold text-gray-900">
              {grade.actualScore}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm tối đa
            </label>
            <p className="text-2xl font-bold text-gray-900">
              {grade.maxScore}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phần trăm
            </label>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.percentage)}`}>
                {grade.percentage}%
              </span>
              <span className="text-sm text-gray-600">
                {getGradeStatus(grade.percentage)}
              </span>
            </div>
          </div>
        </div>

        {grade.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {grade.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chấm bởi
            </label>
            <p className="text-sm text-gray-900">
              {grade.gradedBy?.name || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày chấm
            </label>
            <p className="text-sm text-gray-900">
              {new Date(grade.gradedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    if (!grade) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Chỉnh sửa điểm
          </h3>
          <button
            onClick={() => setMode('view')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <GradeForm
          classId={classId}
          students={students}
          onSuccess={handleSuccess}
          onCancel={() => setMode('view')}
          editGrade={{
            id: grade._id,
            studentId: grade.studentId,
            gradeType: grade.gradeType,
            gradeName: grade.gradeName,
            maxScore: grade.maxScore,
            actualScore: grade.actualScore,
            description: grade.description
          }}
        />
      </div>
    );
  };

  const renderCreateMode = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tạo điểm mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <GradeForm
          classId={classId}
          students={students}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    );
  };

  const getTitle = () => {
    if (mode === 'create') return 'Tạo điểm mới';
    if (mode === 'edit') return 'Chỉnh sửa điểm';
    return 'Chi tiết điểm';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
    >
      <div className="max-w-2xl">
        {mode === 'view' && renderViewMode()}
        {mode === 'edit' && renderEditMode()}
        {mode === 'create' && renderCreateMode()}
      </div>
    </Modal>
  );
};

export default GradeModal;

