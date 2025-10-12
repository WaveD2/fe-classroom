import { Award, BarChart3, Users, BookOpen } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  type?: 'default' | 'grades' | 'statistics' | 'students' | 'classes';
}

const LoadingState = ({ message, type = 'default' }: LoadingStateProps) => {
  const getIcon = () => {
    switch (type) {
      case 'grades':
        return <Award className="w-8 h-8 text-blue-600" />;
      case 'statistics':
        return <BarChart3 className="w-8 h-8 text-green-600" />;
      case 'students':
        return <Users className="w-8 h-8 text-purple-600" />;
      case 'classes':
        return <BookOpen className="w-8 h-8 text-orange-600" />;
      default:
        return <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'grades':
        return 'Đang tải danh sách điểm...';
      case 'statistics':
        return 'Đang tải thống kê...';
      case 'students':
        return 'Đang tải danh sách học sinh...';
      case 'classes':
        return 'Đang tải danh sách lớp học...';
      default:
        return 'Đang tải dữ liệu...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4">
        {getIcon()}
      </div>
      <p className="text-gray-600 text-lg font-medium">
        {getMessage()}
      </p>
      <div className="mt-4 flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingState;



