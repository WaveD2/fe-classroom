import { useState, memo } from 'react';
import { Grade } from '../types';
import { Award, AlertCircle, Edit, Trash2, Eye, User, Calendar, TrendingUp } from 'lucide-react';
import Button from './Button';

interface GradeListProps {
  grades: Grade[];
  loading?: boolean;
  onEdit?: (grade: Grade) => void;
  onDelete?: (gradeId: string) => void;
  onView?: (grade: Grade) => void;
  showActions?: boolean;
  showStudent?: boolean;
  viewMode?: 'grid' | 'list';
}

const GradeList = memo(({ 
  grades, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  showStudent = true,
  viewMode = 'list'
}: GradeListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (gradeId: string) => {
    if (onDelete) {
      onDelete(gradeId);
      setDeleteConfirm(null);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 4.0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeStatus = (score: number) => {
    if (score >= 8.5) return 'Xuất sắc';
    if (score >= 7.0) return 'Giỏi';
    if (score >= 5.5) return 'Khá';
    if (score >= 4.0) return 'Trung bình';
    return 'Yếu';
  };

  const calculateAverage = (grade: Grade) => {
    return (grade.attendance + grade.homework + grade.midterm + grade.final) / 4;
  };

  // ===================================
  // LOADING STATE
  // ===================================

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  // ===================================
  // EMPTY STATE
  // ===================================

  if (grades.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có điểm nào</h3>
        <p className="text-gray-500">Hãy tạo điểm đầu tiên để bắt đầu quản lý</p>
      </div>
    );
  }

  // ===================================
  // GRID VIEW - Card lớn, dễ đọc
  // ===================================

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {grades.map((grade) => {
            const average = calculateAverage(grade);
            
            return (
              <div 
                key={grade._id} 
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 hover:border-blue-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    {showStudent && (
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {grade.studentId.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{grade.studentId.email}</p>
                      </div>
                    )}
                  </div>

                  {showActions && (
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {onView && (
                        <button
                          onClick={() => onView(grade)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(grade)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => setDeleteConfirm(grade._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Grade Scores - Lớn hơn, dễ đọc */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Chuyên cần', value: grade.attendance, weight: '10%' },
                    { label: 'Bài tập', value: grade.homework, weight: '20%' },
                    { label: 'Giữa kỳ', value: grade.midterm, weight: '30%' },
                    { label: 'Cuối kỳ', value: grade.final, weight: '40%' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-2 ${getGradeColor(item.value)}`}>
                      <div className="text-xs font-medium mb-1">
                        {item.label} <span className="text-gray-500">({item.weight})</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {item.value.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Average - Nổi bật */}
                <div className={`rounded-xl border-2 p-5 ${getGradeColor(average)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Điểm trung bình
                      </div>
                      <div className="text-4xl font-bold">
                        {average.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold mb-1">
                        {getGradeStatus(average)}
                      </div>
                      {grade.letterGrade && (
                        <div className="text-sm">
                          {grade.letterGrade} {grade.gpaValue && `(${grade.gpaValue.toFixed(2)})`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Chấm bởi: {grade?.gradedBy?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(grade.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận xóa điểm
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa điểm này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2"
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ===================================
  // LIST VIEW - Dạng Table full-width
  // ===================================

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
              {showStudent && (
                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Học sinh
                  </div>
                </th>
              )}
              <th className="text-center p-4 text-sm font-semibold text-gray-700 min-w-[100px]">
                <div>Chuyên cần</div>
                <div className="text-xs text-gray-500 font-normal">(10%)</div>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700 min-w-[100px]">
                <div>Bài tập</div>
                <div className="text-xs text-gray-500 font-normal">(20%)</div>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700 min-w-[100px]">
                <div>Giữa kỳ</div>
                <div className="text-xs text-gray-500 font-normal">(30%)</div>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700 min-w-[100px]">
                <div>Cuối kỳ</div>
                <div className="text-xs text-gray-500 font-normal">(40%)</div>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700 min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trung bình
                </div>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700">Xếp loại</th>
              <th className="text-center p-4 text-sm font-semibold text-gray-700">Cập nhật</th>
              {showActions && (
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, idx) => {
              const average = calculateAverage(grade);
              
              return (
                <tr 
                  key={grade._id}
                  className={`border-b border-gray-200 hover:bg-blue-50/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {showStudent && (
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {grade.studentId.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {grade.studentId.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {grade.studentId.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {/* Grade Scores - Lớn và rõ ràng */}
                  {[grade.attendance, grade.homework, grade.midterm, grade.final].map((score, idx) => (
                    <td key={idx} className="p-4">
                      <div className="flex justify-center">
                        <div className={`px-4 py-2 rounded-lg font-bold text-lg border-2 ${getGradeColor(score)}`}>
                          {score.toFixed(1)}
                        </div>
                      </div>
                    </td>
                  ))}
                  
                  {/* Average - Nổi bật */}
                  <td className="p-4">
                    <div className="flex justify-center">
                      <div className={`px-5 py-3 rounded-xl font-bold text-2xl border-2 ${getGradeColor(average)}`}>
                        {average.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="p-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(average)}`}>
                        {getGradeStatus(average)}
                      </span>
                      {grade.letterGrade && (
                        <span className="text-sm text-gray-600">
                          {grade.letterGrade} ({grade.gpaValue?.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Update Date */}
                  <td className="p-4 text-center text-sm text-gray-600">
                    <div>{new Date(grade.updatedAt).toLocaleDateString('vi-VN')}</div>
                    <div className="text-xs text-gray-500">
                      {grade?.gradedBy?.name || 'N/A'}
                    </div>
                  </td>
                  
                  {/* Actions */}
                  {showActions && (
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(grade)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(grade)}
                            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => setDeleteConfirm(grade._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận xóa điểm
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa điểm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2"
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

GradeList.displayName = 'GradeList';

export default GradeList;
