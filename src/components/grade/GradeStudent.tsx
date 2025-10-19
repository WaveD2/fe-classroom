import { memo } from 'react';
import { User, Calendar, TrendingUp } from 'lucide-react';
import { Grade } from '../../types';

interface GradeStudentProps {
  grade: Grade 
}

const GradeStudent = memo(({ grade }: GradeStudentProps) => {
  const calculateAverage = (grade: Grade) => {
    return (grade?.attendance + grade?.homework + grade?.midterm + grade?.final || 0) / 4;
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

  const average = calculateAverage(grade);
  if(!average) return
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 hover:border-blue-300">
        {/* Grade Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Chuyên cần', value: grade?.attendance, weight: '10%' },
            { label: 'Bài tập', value: grade?.homework, weight: '20%' },
            { label: 'Giữa kỳ', value: grade?.midterm, weight: '30%' },
            { label: 'Cuối kỳ', value: grade?.final, weight: '40%' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-2 ${getGradeColor(item.value)}`}>
              <div className="text-xs font-medium mb-1">
                {item.label} <span className="text-gray-500">({item.weight})</span>
              </div>
              <div className="text-3xl font-bold">{item.value.toFixed(1)}</div>
            </div>
          ))}
        </div>

        {/* Average */}
        <div className={`rounded-xl border-2 p-5 ${getGradeColor(average)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Điểm trung bình
              </div>
              <div className="text-4xl font-bold">{average.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold mb-1">{getGradeStatus(average)}</div>
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
    </div>
  );
});

GradeStudent.displayName = 'GradeStudent';
export default GradeStudent;
