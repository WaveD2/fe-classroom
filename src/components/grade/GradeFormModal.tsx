import { useState, useEffect, useCallback, memo } from 'react';
import { 
  X, 
  Award, 
  User, 
  Calendar, 
  Calculator,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import { Grade, User as UserType, ClassI, GradeData } from '../../types';
import Button from '../common/Button';
import { showSuccess, showError } from '../Toast';

interface GradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  students: UserType[];
  classData?: ClassI;
  grade?: Grade;
  mode?: 'view' | 'edit' | 'create';
  onUpdateComponent: (studentId: string, data: Partial<GradeData>) => Promise<any>;
  onCalculateFinal: (studentId: string) => Promise<any>;
  onDelete?: (gradeId: string) => Promise<any>;
  onSuccess: () => void;
}

const GradeFormModal = memo(({
  isOpen,
  onClose,
  students,
  classData,
  grade,
  mode: initialMode = 'create',
  onUpdateComponent,
  onCalculateFinal,
  onDelete,
  onSuccess
}: GradeFormModalProps) => {
  const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<GradeData>>({
    attendance: undefined,
    homework: undefined,
    midterm: undefined,
    final: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      
      if (grade) {
        setSelectedStudentId(grade.studentId._id);
        setFormData({
          attendance: grade.attendance,
          homework: grade.homework,
          midterm: grade.midterm,
          final: grade.final
        });
      } else {
        setSelectedStudentId('');
        setFormData({
          attendance: undefined,
          homework: undefined,
          midterm: undefined,
          final: undefined
        });
      }
      setErrors({});
    }
  }, [isOpen, grade, initialMode]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!selectedStudentId && currentMode === 'create') {
      newErrors.studentId = 'Vui lòng chọn học sinh';
    }

    const hasAnyValue = Object.values(formData).some(v => v !== undefined && v !== null);
    if (!hasAnyValue) {
      newErrors.general = 'Vui lòng nhập ít nhất một điểm thành phần';
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Number(value) < 0 || Number(value) > 10) {
          newErrors[key] = 'Điểm phải từ 0 đến 10';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedStudentId, currentMode, formData]);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Only send fields with values
    const dataToSubmit = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key as keyof GradeData] = value;
      }
      return acc;
    }, {} as Partial<GradeData>);

    setLoading(true);
    try {
      await onUpdateComponent(selectedStudentId, dataToSubmit);
      showSuccess(currentMode === 'create' ? 'Tạo điểm thành công' : 'Cập nhật điểm thành công');
      onSuccess();
      
      if (currentMode === 'create') {
        onClose();
      } else {
        setCurrentMode('view');
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData, selectedStudentId, onUpdateComponent, currentMode, onSuccess, onClose]);

  // Handle calculate final
  const handleCalculateFinal = useCallback(async () => {
    setLoading(true);
    try {
      await onCalculateFinal(selectedStudentId);
      showSuccess('Tính điểm tổng kết thành công');
      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, onCalculateFinal, onSuccess]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!grade || !onDelete) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm này?')) return;

    setLoading(true);
    try {
      await onDelete(grade._id);
      showSuccess('Xóa điểm thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [grade, onDelete, onSuccess, onClose]);

  // Handle field change
  const handleFieldChange = useCallback((field: keyof GradeData, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Calculations
  const calculateWeightedAverage = useCallback(() => {
    if (!grade && currentMode === 'view') return 0;
    const data = currentMode === 'view' ? grade : formData;
    if (!data) return 0;
    
    const weights = { attendance: 0.1, homework: 0.2, midterm: 0.3, final: 0.4 };
    return (
      (data.attendance || 0) * weights.attendance +
      (data.homework || 0) * weights.homework +
      (data.midterm || 0) * weights.midterm +
      (data.final || 0) * weights.final
    );
  }, [grade, formData, currentMode]);

  const canCalculateFinal = useCallback(() => {
    const data = currentMode === 'view' ? grade : formData;
    if (!data) return false;
    return data.attendance !== undefined && data.attendance !== null &&
           data.homework !== undefined && data.homework !== null &&
           data.midterm !== undefined && data.midterm !== null &&
           data.final !== undefined && data.final !== null;
  }, [grade, formData, currentMode]);

  const hasCalculatedFinal = useCallback(() => {
    return !!(grade?.letterGrade && grade?.gpaValue);
  }, [grade]);

  const getGradeColor = (average: number) => {
    if (average >= 8.5) return 'bg-green-100 text-green-700 border-green-300';
    if (average >= 7.0) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (average >= 5.5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (average >= 4.0) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getProgressColor = (average: number) => {
    if (average >= 8.5) return 'bg-green-500';
    if (average >= 7.0) return 'bg-blue-500';
    if (average >= 5.5) return 'bg-yellow-500';
    if (average >= 4.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  const selectedStudent = students.find(s => (s._id || s.id) === selectedStudentId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {currentMode === 'create' ? 'Tạo điểm mới' :
                   currentMode === 'edit' ? 'Chỉnh sửa điểm' :
                   'Chi tiết điểm'}
                </h2>
                <p className="text-blue-100 text-sm">{classData?.name || 'Lớp học'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 h-full">
          {currentMode === 'view' && grade ? (
            /* VIEW MODE */
            <>
              {/* Student Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{grade.studentId.name}</h3>
                    <p className="text-sm text-gray-600">{grade.studentId.email}</p>
                  </div>
                </div>
              </div>

              {/* Grade Display */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Điểm thành phần</h4>
                  {hasCalculatedFinal() && (
                    <div className={`px-4 py-2 rounded-lg border font-bold ${getGradeColor(calculateWeightedAverage())}`}>
                      {grade.letterGrade} ({grade.gpaValue?.toFixed(2)})
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{grade.attendance.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Chuyên cần (10%)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{grade.homework.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Bài tập (20%)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{grade.midterm.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Giữa kỳ (30%)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{grade.final.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Cuối kỳ (40%)</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Trung bình trọng số</span>
                    <span className="font-medium">{calculateWeightedAverage().toFixed(2)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${getProgressColor(calculateWeightedAverage())}`}
                      style={{ width: `${Math.min(calculateWeightedAverage() * 10, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(grade.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {grade.gradedBy && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{grade.gradedBy.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => setCurrentMode('edit')} className="flex-1">
                  Chỉnh sửa
                </Button>
                {canCalculateFinal() && !hasCalculatedFinal() && (
                  <Button 
                    onClick={handleCalculateFinal}
                    disabled={loading}
                    className="flex-1 flex gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Tính điểm
                  </Button>
                )}
                {onDelete && (
                  <Button variant="danger" onClick={handleDelete} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* EDIT/CREATE MODE */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              {currentMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Học sinh *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className={`w-full outline-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.studentId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {students.map((student) => (
                      <option key={student._id || student.id} value={student._id || student.id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.studentId}
                    </p>
                  )}
                </div>
              )}

              {/* Student Info in Edit Mode */}
              {currentMode === 'edit' && selectedStudent && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedStudent.name}</h3>
                      <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grade Inputs */}
              {selectedStudentId && (
                <div className=' '>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'attendance', label: 'Chuyên cần', icon: '📅', weight: '10%' },
                      { key: 'homework', label: 'Bài tập', icon: '📝', weight: '20%' },
                      { key: 'midterm', label: 'Giữa kỳ', icon: '📊', weight: '30%' },
                      { key: 'final', label: 'Cuối kỳ', icon: '🎯', weight: '40%' }
                    ].map(({ key, label, icon, weight }) => (
                      <div key={key} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">{label}</label>
                              <span className="text-xs text-gray-500">{weight}</span>
                            </div>
                          </div>
                          {formData[key as keyof GradeData] !== undefined && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (formData[key as keyof GradeData] || 0) >= 8 ? 'bg-green-100 text-green-700' :
                              (formData[key as keyof GradeData] || 0) >= 6.5 ? 'bg-blue-100 text-blue-700' :
                              (formData[key as keyof GradeData] || 0) >= 5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {formData[key as keyof GradeData]?.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData[key as keyof GradeData] ?? ''}
                          onChange={(e) => handleFieldChange(key as keyof GradeData, e.target.value)}
                          className={`w-full outline-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[key] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.0 - 10.0"
                          disabled={loading}
                        />
                        {errors[key] && (
                          <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 ">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => currentMode === 'edit' ? setCurrentMode('view') : onClose()}
                      disabled={loading}
                      className="flex-1"
                    >
                      {currentMode === 'edit' ? 'Hủy' : 'Đóng'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <div>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang lưu...
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <Save className="w-4 h-4 mr-2" />
                          {currentMode === 'create' ? 'Tạo điểm' : 'Cập nhật'}
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

GradeFormModal.displayName = 'GradeFormModal';

export default GradeFormModal;

