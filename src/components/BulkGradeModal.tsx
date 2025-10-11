import { useState, useRef } from 'react';
import { User, GRADE_TYPE, CreateGradeRequest } from '../types';
import Modal from './Modal';
import Button from './Button';
import { useGradeForm } from '../hook/useGrade';
import { Upload, Download, Plus, Trash2, Award } from 'lucide-react';

interface BulkGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  students: User[];
  onSuccess: () => void;
}

interface GradeRow {
  id: string;
  studentId: string;
  gradeType: GRADE_TYPE;
  gradeName: string;
  maxScore: number;
  actualScore: number;
  description: string;
}

const BulkGradeModal = ({ isOpen, onClose, classId, students, onSuccess }: BulkGradeModalProps) => {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkCreateGrades, loading } = useGradeForm();

  const addGradeRow = () => {
    const newGrade: GradeRow = {
      id: Date.now().toString(),
      studentId: '',
      gradeType: GRADE_TYPE.ASSIGNMENT,
      gradeName: '',
      maxScore: 100,
      actualScore: 0,
      description: ''
    };
    setGrades([...grades, newGrade]);
  };

  const removeGradeRow = (id: string) => {
    setGrades(grades.filter(grade => grade.id !== id));
  };

  const updateGradeRow = (id: string, field: keyof GradeRow, value: any) => {
    setGrades(grades.map(grade => 
      grade.id === id ? { ...grade, [field]: value } : grade
    ));
    
    // Clear error for this field
    const errorKey = `${id}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateGrades = () => {
    const newErrors: Record<string, string> = {};
    
    grades.forEach(grade => {
      if (!grade.studentId) {
        newErrors[`${grade.id}-studentId`] = 'Chọn học sinh';
      }
      if (!grade.gradeName.trim()) {
        newErrors[`${grade.id}-gradeName`] = 'Nhập tên điểm';
      }
      if (grade.maxScore <= 0) {
        newErrors[`${grade.id}-maxScore`] = 'Điểm tối đa > 0';
      }
      if (grade.actualScore < 0) {
        newErrors[`${grade.id}-actualScore`] = 'Điểm thực tế ≥ 0';
      }
      if (grade.actualScore > grade.maxScore) {
        newErrors[`${grade.id}-actualScore`] = 'Điểm thực tế ≤ điểm tối đa';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (grades.length === 0) {
      alert('Vui lòng thêm ít nhất một điểm');
      return;
    }

    if (!validateGrades()) {
      return;
    }

    try {
      const gradeData: CreateGradeRequest[] = grades.map(grade => ({
        classId,
        studentId: grade.studentId,
        gradeType: grade.gradeType,
        gradeName: grade.gradeName,
        maxScore: grade.maxScore,
        actualScore: grade.actualScore,
        description: grade.description
      }));

      await bulkCreateGrades(gradeData);
      onSuccess();
      onClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Here you would implement CSV/Excel parsing
    // For now, we'll just show a placeholder
    alert('Tính năng upload file sẽ được triển khai trong phiên bản tiếp theo');
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = ['Học sinh', 'Loại điểm', 'Tên điểm', 'Điểm tối đa', 'Điểm thực tế', 'Mô tả'];
    const csvContent = [
      headers.join(','),
      'Nguyễn Văn A,assignment,Bài tập 1,100,85,Mô tả bài tập',
      'Trần Thị B,quiz,Kiểm tra 15 phút,100,90,Mô tả kiểm tra'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'grade_template.csv';
    link.click();
  };

  const getGradeTypeLabel = (type: GRADE_TYPE) => {
    const labels = {
      [GRADE_TYPE.ASSIGNMENT]: 'Bài tập',
      [GRADE_TYPE.QUIZ]: 'Kiểm tra',
      [GRADE_TYPE.PROJECT]: 'Dự án',
      [GRADE_TYPE.EXAM]: 'Dự án',
      [GRADE_TYPE.PARTICIPATION]: 'Tham gia',
      [GRADE_TYPE.HOMEWORK]: 'Bài về nhà',
    };
    return labels[type];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo điểm hàng loạt"
    >
      <div className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload file Excel/CSV
              </h3>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-gray-50 border border-blue-300 text-blue-700"
              >
                <Upload size={16} className="mr-2" />
                Chọn file
              </Button>
              <Button
                variant="secondary"
                onClick={downloadTemplate}
                className="bg-white hover:bg-gray-50 border border-green-300 text-green-700"
              >
                <Download size={16} className="mr-2" />
                Tải template
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hướng dẫn:</strong> Tải template CSV, điền thông tin điểm số, sau đó upload file lên hệ thống.
              </p>
              <p className="text-sm text-gray-500">
                Hoặc nhập thông tin trực tiếp bên dưới
              </p>
            </div>
          </div>

          {/* Manual Input Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Nhập thông tin điểm
                </h3>
              </div>
              <Button
                onClick={addGradeRow}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Thêm điểm
              </Button>
            </div>

            {grades.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có điểm nào</h4>
                <p className="text-gray-500 mb-4">Nhấn "Thêm điểm" để bắt đầu tạo điểm cho học sinh</p>
                <Button
                  onClick={addGradeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Thêm điểm đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {grades.map((grade, index) => (
                  <div key={grade.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Điểm #{index + 1}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeGradeRow(grade.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa điểm này"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Học sinh *
                        </label>
                        <select
                          value={grade.studentId}
                          onChange={(e) => updateGradeRow(grade.id, 'studentId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          <option value="">Chọn học sinh</option>
                          {students.map(student => (
                            <option key={student._id} value={student._id}>
                              {student.name} ({student.email})
                            </option>
                          ))}
                        </select>
                        {errors[`${grade.id}-studentId`] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                            {errors[`${grade.id}-studentId`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Loại điểm *
                        </label>
                        <select
                          value={grade.gradeType}
                          onChange={(e) => updateGradeRow(grade.id, 'gradeType', e.target.value as GRADE_TYPE)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          {Object.values(GRADE_TYPE).map(type => (
                            <option key={type} value={type}>
                              {getGradeTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên điểm *
                        </label>
                        <input
                          type="text"
                          value={grade.gradeName}
                          onChange={(e) => updateGradeRow(grade.id, 'gradeName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          placeholder="Ví dụ: Bài tập 1"
                        />
                        {errors[`${grade.id}-gradeName`] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                            {errors[`${grade.id}-gradeName`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Điểm tối đa *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={grade.maxScore}
                          onChange={(e) => updateGradeRow(grade.id, 'maxScore', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        />
                        {errors[`${grade.id}-maxScore`] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                            {errors[`${grade.id}-maxScore`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Điểm thực tế *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={grade.maxScore}
                          value={grade.actualScore}
                          onChange={(e) => updateGradeRow(grade.id, 'actualScore', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        />
                        {errors[`${grade.id}-actualScore`] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                            {errors[`${grade.id}-actualScore`]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mô tả
                        </label>
                        <input
                          type="text"
                          value={grade.description}
                          onChange={(e) => updateGradeRow(grade.id, 'description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          placeholder="Mô tả thêm..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-xl p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{grades.length}</span> điểm đã được thêm
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || grades.length === 0}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tạo...
                    </div>
                  ) : (
                    `Tạo ${grades.length} điểm`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkGradeModal;
