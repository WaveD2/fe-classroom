import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import {
  X,
  Users,
  Save,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { User as UserType, ClassI, GradeData } from '../types';
import Button from './Button';
import { showSuccess, showError } from './Toast';
interface BulkGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  students: UserType[];
  classData?: ClassI;
  onBulkUpdate: (grades: { studentId: string; gradeData: Partial<GradeData> }[]) => Promise<void>;
  onSuccess: () => void;
}

interface StudentGrade {
  studentId: string;
  student: UserType;
  attendance?: number;
  homework?: number;
  midterm?: number;
  final?: number;
}

type FilterMode = 'all' | 'edited' | 'valid' | 'invalid';
type GradeField = keyof Pick<StudentGrade, 'attendance' | 'homework' | 'midterm' | 'final'>;

const GRADE_FIELDS: Array<{ key: GradeField; label: string; weight: string }> = [
  { key: 'attendance', label: 'Chuyên cần', weight: '10%' },
  { key: 'homework', label: 'Bài tập', weight: '20%' },
  { key: 'midterm', label: 'Giữa kỳ', weight: '30%' },
  { key: 'final', label: 'Cuối kỳ', weight: '40%' }
];

const FILTER_MODES: Array<{ value: FilterMode; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'edited', label: 'Đã nhập' },
  { value: 'valid', label: 'Hợp lệ' },
  { value: 'invalid', label: 'Lỗi' }
];

const isValidGrade = (value: number | undefined): boolean => {
  if (value === undefined || value === null) return true;
  return value >= 0 && value <= 10;
};

const hasAnyGrade = (grade: StudentGrade): boolean => {
  return grade.attendance !== undefined ||
         grade.homework !== undefined ||
         grade.midterm !== undefined ||
         grade.final !== undefined;
};

const isValidRow = (grade: StudentGrade): boolean => {
  if (!hasAnyGrade(grade)) return false;
  return isValidGrade(grade.attendance) &&
         isValidGrade(grade.homework) &&
         isValidGrade(grade.midterm) &&
         isValidGrade(grade.final);
};

const getGradeColor = (value: number | undefined): string => {
  if (value === undefined) return 'border-gray-300 bg-white';
  if (!isValidGrade(value)) return 'border-red-300 bg-red-50';
  if (value >= 8) return 'border-green-300 bg-green-50 text-green-700';
  if (value >= 6.5) return 'border-blue-300 bg-blue-50 text-blue-700';
  if (value >= 5) return 'border-yellow-300 bg-yellow-50 text-yellow-700';
  return 'border-orange-300 bg-orange-50 text-orange-700';
};

const getRowColor = (grade: StudentGrade): string => {
  const hasGrades = hasAnyGrade(grade);
  if (!hasGrades) return 'bg-white border-gray-200 hover:border-gray-300';
  const isValid = isValidRow(grade);
  return isValid 
    ? 'bg-green-50/50 border-green-200' 
    : 'bg-red-50/50 border-red-200';
};

const BulkGradeModal = memo(({
  isOpen,
  onClose,
  students,
  classData,
  onBulkUpdate,
  onSuccess
}: BulkGradeModalProps) => {
  // State
  const [grades, setGrades] = useState<Map<string, StudentGrade>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  useEffect(() => {
    if (isOpen && students.length > 0) {
      const newGrades = new Map<string, StudentGrade>();
      students.forEach(student => {
        const id = student._id || student.id;
        newGrades.set(id, {
          studentId: id,
          student,
          attendance: undefined,
          homework: undefined,
          midterm: undefined,
          final: undefined
        });
      });
      setGrades(newGrades);
      setSearchTerm('');
      setFilterMode('all');
    }
  }, [isOpen, students]);

  // Update single grade
  const updateGrade = useCallback((studentId: string, field: GradeField, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setGrades(prev => {
      const newGrades = new Map(prev);
      const grade = newGrades.get(studentId);
      if (grade) {
        newGrades.set(studentId, { ...grade, [field]: numValue });
      }
      return newGrades;
    });
  }, []);

  const applyToAll = useCallback((field: GradeField, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setGrades(prev => {
      const newGrades = new Map(prev);
      newGrades.forEach((grade, studentId) => {
        newGrades.set(studentId, { ...grade, [field]: numValue });
      });
      return newGrades;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm('Xóa tất cả dữ liệu đã nhập?')) return;
    setGrades(prev => {
      const newGrades = new Map(prev);
      newGrades.forEach((grade, studentId) => {
        newGrades.set(studentId, {
          ...grade,
          attendance: undefined,
          homework: undefined,
          midterm: undefined,
          final: undefined
        });
      });
      return newGrades;
    });
  }, []);

  const stats = useMemo(() => {
    const allGrades = Array.from(grades.values());
    const edited = allGrades.filter(hasAnyGrade);
    const valid = edited.filter(isValidRow);
    const invalid = edited.filter(g => !isValidRow(g));

    return {
      total: allGrades.length,
      edited: edited.length,
      valid: valid.length,
      invalid: invalid.length
    };
  }, [grades]);

  const filteredRows = useMemo(() => {
    let rows = Array.from(grades.values());

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(g => 
        g.student.name.toLowerCase().includes(term) ||
        g.student.email.toLowerCase().includes(term)
      );
    }

    // Mode filter
    switch (filterMode) {
      case 'edited':
        rows = rows.filter(hasAnyGrade);
        break;
      case 'valid':
        rows = rows.filter(g => hasAnyGrade(g) && isValidRow(g));
        break;
      case 'invalid':
        rows = rows.filter(g => hasAnyGrade(g) && !isValidRow(g));
        break;
    }

    return rows;
  }, [grades, searchTerm, filterMode]);

  // Submit
  const handleSubmit = useCallback(async () => {
    const validGrades = Array.from(grades.values())
      .filter(g => hasAnyGrade(g) && isValidRow(g));

    if (validGrades.length === 0) {
      showError('Vui lòng nhập điểm hợp lệ cho ít nhất một học sinh');
      return;
    }

    const payload = validGrades.map(g => ({
      studentId: g.studentId,
      gradeData: {
        ...(g.attendance !== undefined && { attendance: g.attendance }),
        ...(g.homework !== undefined && { homework: g.homework }),
        ...(g.midterm !== undefined && { midterm: g.midterm }),
        ...(g.final !== undefined && { final: g.final })
      }
    }));

    setLoading(true);
    try {
      await onBulkUpdate(payload);
      showSuccess(`Đã cập nhật điểm cho ${validGrades.length} học sinh`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [grades, onBulkUpdate, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={loading ? undefined : onClose} 
      />
      
      <div className="absolute inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)]">
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Nhập điểm hàng loạt</h2>
                <p className="text-indigo-100 text-sm">{classData?.name || 'Lớp học'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {[
              { label: 'Tổng', value: stats.total, color: 'text-white' },
              { label: 'Đã nhập', value: stats.edited, color: 'text-yellow-300' },
              { label: 'Hợp lệ', value: stats.valid, color: 'text-green-300' },
              { label: 'Lỗi', value: stats.invalid, color: 'text-red-300' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-2 md:p-3">
                <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-xs text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar - Fixed */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm học sinh..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {FILTER_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setFilterMode(mode.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterMode === mode.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
              
              <button
                onClick={handleReset}
                disabled={loading || stats.edited === 0}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Reset tất cả"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Header - Sticky */}
        <div className="flex-shrink-0 bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="grid grid-cols-12 gap-2 p-2 md:p-3 text-[10px] md:text-xs font-medium text-gray-600">
            <div className="col-span-3 md:col-span-3">Học sinh</div>
            {GRADE_FIELDS.map(field => (
              <div key={field.key} className="col-span-2 text-center">
                <div className="mb-1">{field.label} ({field.weight})</div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Tất cả"
                  onChange={(e) => applyToAll(field.key, e.target.value)}
                  disabled={loading}
                  className="w-full px-1 md:px-2 py-1 text-center border border-gray-300 rounded text-[10px] md:text-xs focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            ))}
            <div className="col-span-1 text-center hidden md:block">
              <div className="mb-1">Status</div>
            </div>
          </div>
        </div>

        {/* Table Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1 md:space-y-2 bg-gray-50">
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">
                {searchTerm ? 'Không tìm thấy học sinh' : 'Không có học sinh nào'}
              </p>
            </div>
          ) : (
            filteredRows.map(grade => {
              const hasGrades = hasAnyGrade(grade);
              const isValid = isValidRow(grade);

              return (
                <div
                  key={grade.studentId}
                  className={`grid grid-cols-12 gap-2 p-2 rounded-lg border transition-all ${getRowColor(grade)}`}
                >
                  {/* Student Info */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {grade.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {grade.student.name}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500 truncate">
                        {grade.student.email}
                      </div>
                    </div>
                  </div>

                  {/* Grade Inputs */}
                  {GRADE_FIELDS.map(field => (
                    <div key={field.key} className="col-span-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={grade[field.key] ?? ''}
                        onChange={(e) => updateGrade(grade.studentId, field.key, e.target.value)}
                        placeholder="0.0"
                        disabled={loading}
                        className={`w-full px-1 md:px-2 py-1 md:py-1.5 text-center border rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 transition-colors ${
                          getGradeColor(grade[field.key])
                        }`}
                      />
                    </div>
                  ))}

                  {/* Status Icon */}
                  <div className="col-span-1 flex items-center justify-center">
                    {hasGrades ? (
                      isValid ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                      )
                    ) : (
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-3 md:p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs md:text-sm text-gray-600">
              Hợp lệ: <span className="font-bold text-indigo-600">{stats.valid}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-500">{stats.total}</span>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="text-sm"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || stats.valid === 0}
                className="min-w-[100px] md:min-w-[120px] text-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Lưu ({stats.valid})</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BulkGradeModal.displayName = 'BulkGradeModal';

export default BulkGradeModal;
