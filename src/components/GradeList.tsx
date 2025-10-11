import { useState } from 'react';
import { Grade, GRADE_TYPE } from '../types';
import Button from './Button';
import { Edit, Trash2, Eye } from 'lucide-react';

interface GradeListProps {
  grades: Grade[];
  loading?: boolean;
  onEdit?: (grade: Grade) => void;
  onDelete?: (gradeId: string) => void;
  onView?: (grade: Grade) => void;
  showActions?: boolean;
  showStudent?: boolean;
}

const GradeList = ({ 
  grades, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  showStudent = false 
}: GradeListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getGradeTypeLabel = (type: GRADE_TYPE) => {
    const labels = {
      [GRADE_TYPE.ASSIGNMENT]: 'Bài tập',
      [GRADE_TYPE.QUIZ]: 'Kiểm tra',
      [GRADE_TYPE.PROJECT]: 'Dự án',
      [GRADE_TYPE.PARTICIPATION]: 'Tham gia',
      [GRADE_TYPE.HOMEWORK]: 'Bài về nhà',
      [GRADE_TYPE.EXAM]: 'Bài về nhà',
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

  const handleDelete = (gradeId: string) => {
    if (onDelete) {
      onDelete(gradeId);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có điểm nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grades.map((grade) => (
        <div
          key={grade._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getGradeTypeLabel(grade.gradeType)}
                </span>
                <h3 className="text-lg font-medium text-gray-900">
                  {grade.gradeName}
                </h3>
              </div>

              {showStudent && (
                <p className="text-sm text-gray-600 mb-2">
                  Học sinh: {grade.student?.name || 'N/A'}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Điểm: {grade.actualScore}/{grade.maxScore}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.percentage)}`}>
                  {grade.percentage}% - {getGradeStatus(grade.percentage)}
                </span>
                <span>
                  Chấm bởi: {grade.gradedBy?.name || 'N/A'}
                </span>
                <span>
                  {new Date(grade.gradedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {grade.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {grade.description}
                </p>
              )}
            </div>

            {showActions && (
              <div className="flex items-center space-x-2 ml-4">
                {onView && (
                  <button
                    onClick={() => onView(grade)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(grade)}
                    className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => setDeleteConfirm(grade._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa điểm
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa điểm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeList;
