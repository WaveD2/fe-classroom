import { memo } from 'react';
import { BarChart3, Users, Award, Star } from 'lucide-react';

interface GradeStatsProps {
  statistics: any;
  loading?: boolean;
}

const GradeStats = memo(({ statistics, loading = false }: GradeStatsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu thống kê</h3>
        <p className="text-gray-500">Chưa có điểm số nào trong lớp học này</p>
      </div>
    );
  }

  const { classInfo, statistics: stats } = statistics;

  const getGradeDistributionColor = (type: string) => {
    switch (type) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'fail': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getGradeDistributionLabel = (type: string) => {
    switch (type) {
      case 'excellent': return 'Xuất sắc (≥8.5)';
      case 'good': return 'Giỏi (7.0-8.4)';
      case 'fair': return 'Khá (5.5-6.9)';
      case 'poor': return 'Trung bình (4.0-5.4)';
      case 'fail': return 'Yếu (<4.0)';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Class Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{classInfo.name}</h2>
            <p className="text-gray-600">{classInfo.description}</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Tổng số học sinh: <span className="font-semibold">{stats.totalStudents}</span>
        </div>
      </div>

      {/* Average Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageAttendance.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Chuyên cần TB</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageHomework.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Bài tập TB</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageMidterm.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Giữa kỳ TB</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageFinal.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Cuối kỳ TB</div>
        </div>
      </div>

      {/* Overall Average */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Điểm trung bình tổng</h3>
            <p className="text-gray-600">Tất cả các loại điểm</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.averageOverall.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">/ 10</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              stats.averageOverall >= 8.5 ? 'bg-green-500' :
              stats.averageOverall >= 7.0 ? 'bg-blue-500' :
              stats.averageOverall >= 5.5 ? 'bg-yellow-500' :
              stats.averageOverall >= 4.0 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${(stats.averageOverall / 10) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Phân bố điểm số
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(stats.gradeDistribution).map(([type, count] : any) => (
            <div key={type} className="text-center">
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mb-2 ${getGradeDistributionColor(type)}`}>
                {getGradeDistributionLabel(type)}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">học sinh</div>
            </div>
          ))}
        </div>
      </div>

      {stats.topPerformers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Học sinh xuất sắc
          </h3>
          <div className="space-y-3">
            {stats.topPerformers.slice(0, 5).map((performer : any, index: number) => (
              <div key={performer.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{performer.studentName}</div>
                    <div className="text-sm text-gray-600">{performer.studentEmail}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {performer.averageGrade.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">điểm TB</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

GradeStats.displayName = 'GradeStats';

export default GradeStats;