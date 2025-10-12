import   { memo, useMemo } from 'react';
import { 
  BookOpen, 
  Users, 
  Activity, 
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { ClassI, PaginationInfo } from '../types';

interface DashboardStatsProps {
  classes: ClassI[];
  pagination: PaginationInfo;
  loading: boolean;
  userRole: string;
}

const DashboardStats = memo(({ classes, pagination, loading, userRole }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const activeClasses = classes.filter(c => c.status === 'open').length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const uniqueTeachers = new Set(classes.filter(c => c.teacher).map(c => c.teacher?.id)).size;
    const averageStudents = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

    return {
      totalClasses: pagination.total,
      activeClasses,
      totalStudents,
      uniqueTeachers,
      averageStudents
    };
  }, [classes, pagination.total]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

  const getStatsForRole = () => {
    switch (userRole) {
      case 'STUDENT':
        return [
          {
            icon: BookOpen,
            label: 'Lớp đã tham gia',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp đang học',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Bạn học cùng',
            value: stats.totalStudents - 1, // Trừ chính mình
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: GraduationCap,
            label: 'Giáo viên',
            value: stats.uniqueTeachers,
            color: 'orange',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-600'
          }
        ];
      case 'TEACHER':
        return [
          {
            icon: BookOpen,
            label: 'Lớp của tôi',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp đang dạy',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Tổng học sinh',
            value: stats.totalStudents,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: BarChart3,
            label: 'TB học sinh/lớp',
            value: stats.averageStudents,
            color: 'indigo',
            bgColor: 'bg-indigo-100',
            textColor: 'text-indigo-600'
          }
        ];
      case 'ADMIN':
        return [
          {
            icon: BookOpen,
            label: 'Tổng lớp học',
            value: stats.totalClasses,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
          },
          {
            icon: Activity,
            label: 'Lớp hoạt động',
            value: stats.activeClasses,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          },
          {
            icon: Users,
            label: 'Tổng học sinh',
            value: stats.totalStudents,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600'
          },
          {
            icon: GraduationCap,
            label: 'Giáo viên',
            value: stats.uniqueTeachers,
            color: 'orange',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-600'
          }
        ];
      default:
        return [];
    }
  };

  const statsData = getStatsForRole();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={stat.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <IconComponent className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;


