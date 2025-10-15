import   { memo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award,
  PieChart,
  Target
} from 'lucide-react';
import { ClassGradeStatisticsResponse } from '../../types';

interface GradeStatisticsProps {
  statistics: ClassGradeStatisticsResponse | null;
  loading?: boolean;
}

const GradeStatistics = memo(({ statistics, loading = false }: GradeStatisticsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thống kê</h3>
        <p className="text-gray-500">Không có dữ liệu thống kê để hiển thị</p>
      </div>
    );
  }

  const { classInfo, statistics: stats, grades } = statistics.data;

  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': 'bg-green-500',
      'A': 'bg-green-400',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C+': 'bg-yellow-500',
      'C': 'bg-yellow-400',
      'D+': 'bg-orange-500',
      'D': 'bg-orange-400',
      'F': 'bg-red-500'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-400';
  };

  const getGradeLabel = (grade: string) => {
    const labels = {
      'A+': 'Xuất sắc (4.0)',
      'A': 'Giỏi (3.7)',
      'B+': 'Khá giỏi (3.3)',
      'B': 'Khá (3.0)',
      'C+': 'Trung bình khá (2.7)',
      'C': 'Trung bình (2.3)',
      'D+': 'Trung bình yếu (2.0)',
      'D': 'Yếu (1.7)',
      'F': 'Kém (0.0)'
    };
    return labels[grade as keyof typeof labels] || grade;
  };

  const getTopPerformers = () => {
    return grades
      .filter(grade => grade.gpaValue !== null && grade.gpaValue !== undefined)
      .sort((a, b) => (b.gpaValue || 0) - (a.gpaValue || 0))
      .slice(0, 5);
  };

  const getGradeDistributionData = () => {
    return Object.entries(stats.gradeDistribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: stats.studentsWithFinalGrade > 0 ? (count / stats.studentsWithFinalGrade) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{classInfo.name}</h3>
            <p className="text-sm text-gray-600">{classInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              <div className="text-sm text-gray-600">Tổng học sinh</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.studentsWithFinalGrade}</div>
              <div className="text-sm text-gray-600">Đã có điểm tổng kết</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{parseFloat(stats.averageGPA).toFixed(2)}</div>
              <div className="text-sm text-gray-600">GPA trung bình</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.studentsWithFinalGrade > 0 ? 
                  Math.round((stats.studentsWithFinalGrade / stats.totalStudents) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <PieChart className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Phân bố điểm</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getGradeDistributionData().map(({ grade, count, percentage }) => (
            <div key={grade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getGradeColor(grade)}`} />
                <div>
                  <div className="font-medium text-gray-900">{grade}</div>
                  <div className="text-sm text-gray-600">{getGradeLabel(grade)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade Distribution Chart */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Phân bố điểm</span>
            <span>Tổng: {stats.studentsWithFinalGrade} học sinh</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="flex h-full">
              {getGradeDistributionData().map(({ grade, percentage }) => (
                <div
                  key={grade}
                  className={`${getGradeColor(grade)} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                  title={`${grade}: ${percentage.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {getTopPerformers().length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Top 5 học sinh xuất sắc</h4>
          </div>

          <div className="space-y-3">
            {getTopPerformers().map((grade, index) => (
              <div key={grade._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full text-yellow-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{grade.studentId.name}</div>
                    <div className="text-sm text-gray-600">{grade.studentId.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {grade.letterGrade} ({grade.gpaValue?.toFixed(2)})
                  </div>
                  <div className="text-sm text-gray-600">
                    {grade.attendance}/{grade.homework}/{grade.midterm}/{grade.final}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tiến độ</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Học sinh có điểm thành phần</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.studentsWithGrades / stats.totalStudents) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.studentsWithGrades}/{stats.totalStudents}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Học sinh đã tính điểm tổng kết</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.studentsWithFinalGrade / stats.totalStudents) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.studentsWithFinalGrade}/{stats.totalStudents}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Học sinh chưa có điểm</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.studentsWithoutGrades / stats.totalStudents) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.studentsWithoutGrades}/{stats.totalStudents}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GradeStatistics.displayName = 'GradeStatistics';

export default GradeStatistics;
