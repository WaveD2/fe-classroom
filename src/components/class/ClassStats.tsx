import { memo , useMemo } from 'react';
import { BookOpen, Activity, Users, GraduationCap } from 'lucide-react';
import { ClassI, PaginationInfo } from '../../types';

interface ClassStatsProps {
  classes: ClassI[];
  pagination: PaginationInfo;
  loading: boolean;
}

const ClassStats = memo(({ classes, pagination, loading }: ClassStatsProps) => {
  const stats = useMemo(() => {
    const activeClasses = classes.filter(c => c.status === 'open').length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const uniqueTeachers = new Set(classes.filter(c => c.teacher).map(c => c.teacher?.id)).size;

    return {
      totalClasses: pagination.total,
      activeClasses,
      totalStudents,
      uniqueTeachers
    };
  }, [classes, pagination.total]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-24">
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="w-16 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            <p className="text-sm text-gray-600">Tổng lớp học</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeClasses}</p>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-sm text-gray-600">Tổng học sinh</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueTeachers}</p>
            <p className="text-sm text-gray-600">Giáo viên</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ClassStats.displayName = 'ClassStats';

export default ClassStats;
