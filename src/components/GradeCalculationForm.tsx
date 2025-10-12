import  { useState, memo } from 'react';
import { 
  Calculator, 
  Users, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Grade, User as UserType } from '../types';
import Button from './Button';

interface GradeCalculationFormProps {
  classId: string;
  students: UserType[];
  grades: Grade[];
  onCalculateSingle: (studentId: string) => Promise<void>;
  onCalculateAll: () => Promise<void>;
  loading?: boolean;
}

const GradeCalculationForm = memo(({ 
  students,
  grades,
  onCalculateSingle,
  onCalculateAll,
  loading = false
}: GradeCalculationFormProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [calculatingAll, setCalculatingAll] = useState(false);

  const getStudentGrade = (studentId: string) => {
    return grades.find(grade => grade.studentId._id === studentId);
  };

  const canCalculateGrade = (studentId: string) => {
    const grade = getStudentGrade(studentId);
    if (!grade) return false;
    
    return grade.attendance !== undefined && 
           grade.homework !== undefined && 
           grade.midterm !== undefined && 
           grade.final !== undefined &&
           grade.attendance !== null &&
           grade.homework !== null &&
           grade.midterm !== null &&
           grade.final !== null;
  };

  const hasCalculatedGrade = (studentId: string) => {
    const grade = getStudentGrade(studentId);
    return grade?.letterGrade && grade?.gpaValue;
  };

  const getGradeStatus = (studentId: string) => {
    const grade = getStudentGrade(studentId);
    if (!grade) return { status: 'no-grade', text: 'Chưa có điểm', color: 'gray' };
    
    const hasAllComponents = canCalculateGrade(studentId);
    const hasCalculated = hasCalculatedGrade(studentId);
    
    if (hasCalculated) {
      return { status: 'calculated', text: 'Đã tính', color: 'green' };
    } else if (hasAllComponents) {
      return { status: 'ready', text: 'Sẵn sàng tính', color: 'blue' };
    } else {
      return { status: 'incomplete', text: 'Thiếu điểm', color: 'orange' };
    }
  };

  const getStudentsReadyForCalculation = () => {
    return students.filter(student => canCalculateGrade(student._id) && !hasCalculatedGrade(student._id));
  };

  const handleCalculateSingle = async () => {
    if (!selectedStudentId) return;
    try {
      await onCalculateSingle(selectedStudentId);
      setSelectedStudentId('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleCalculateAll = async () => {
    setCalculatingAll(true);
    try {
      await onCalculateAll();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setCalculatingAll(false);
    }
  };

  const readyStudents = getStudentsReadyForCalculation();
  const totalStudents = students.length;
  const calculatedCount = students.filter(student => hasCalculatedGrade(student._id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tính điểm tổng kết</h3>
            <p className="text-sm text-gray-600">
              Tính toán letterGrade và gpaValue cho học sinh
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
              <div className="text-sm text-gray-600">Tổng học sinh</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{calculatedCount}</div>
              <div className="text-sm text-gray-600">Đã tính điểm</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{readyStudents.length}</div>
              <div className="text-sm text-gray-600">Sẵn sàng tính</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Single Student */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Tính điểm cho học sinh cụ thể</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn học sinh
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Chọn học sinh</option>
              {students.map((student) => {
                const gradeStatus = getGradeStatus(student._id);
                return (
                  <option 
                    key={student._id} 
                    value={student._id}
                    disabled={gradeStatus.status === 'no-grade' || gradeStatus.status === 'calculated'}
                  >
                    {student.name} - {gradeStatus.text}
                  </option>
                );
              })}
            </select>
          </div>

          <Button
            onClick={handleCalculateSingle}
            disabled={loading || !selectedStudentId || !canCalculateGrade(selectedStudentId)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Đang tính...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Tính điểm cho học sinh này
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Calculate All Students */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Tính điểm cho toàn bộ lớp</h4>
        
        {readyStudents.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Thông báo</span>
              </div>
              <p className="text-sm text-blue-800">
                Sẽ tính điểm tổng kết cho {readyStudents.length} học sinh có đủ điểm thành phần.
              </p>
            </div>

            <Button
              onClick={handleCalculateAll}
              disabled={loading || calculatingAll || readyStudents.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            >
              {calculatingAll ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang tính điểm cho {readyStudents.length} học sinh...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Tính điểm cho {readyStudents.length} học sinh
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">
              Không có học sinh nào sẵn sàng để tính điểm tổng kết.
            </p>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Danh sách học sinh</h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {students.map((student) => {
            const gradeStatus = getGradeStatus(student._id);
            const grade = getStudentGrade(student._id);
            
            return (
              <div 
                key={student._id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  gradeStatus.status === 'calculated' ? 'bg-green-50 border-green-200' :
                  gradeStatus.status === 'ready' ? 'bg-blue-50 border-blue-200' :
                  gradeStatus.status === 'incomplete' ? 'bg-orange-50 border-orange-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    gradeStatus.status === 'calculated' ? 'bg-green-500' :
                    gradeStatus.status === 'ready' ? 'bg-blue-500' :
                    gradeStatus.status === 'incomplete' ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    gradeStatus.status === 'calculated' ? 'text-green-700' :
                    gradeStatus.status === 'ready' ? 'text-blue-700' :
                    gradeStatus.status === 'incomplete' ? 'text-orange-700' :
                    'text-gray-500'
                  }`}>
                    {gradeStatus.text}
                  </span>
                  
                  {gradeStatus.status === 'calculated' && grade && (
                    <div className="text-sm font-bold text-green-600">
                      {grade.letterGrade} ({grade.gpaValue})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

GradeCalculationForm.displayName = 'GradeCalculationForm';

export default GradeCalculationForm;
