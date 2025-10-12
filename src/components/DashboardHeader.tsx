import  { memo } from 'react';
import { 
  QrCode, 
  PlusCircle, 
  BookOpen, 
  Grid,
  List,
  ArrowRight
} from 'lucide-react';
import Button from './Button';
import SearchBar from './Search';
import { ROLE } from '../types';

interface DashboardHeaderProps {
  userRole: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onQRScannerOpen: () => void;
  onCreateClassOpen: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const DashboardHeader = memo(({ 
  userRole, 
  searchTerm, 
  onSearchChange, 
  onQRScannerOpen, 
  onCreateClassOpen,
  viewMode,
  onViewModeChange
}: DashboardHeaderProps) => {
  const getTitle = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'Lớp học của tôi';
      case ROLE.TEACHER:
        return 'Quản lý lớp học';
      case ROLE.ADMIN:
        return 'Dashboard quản trị';
      default:
        return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'Tham gia và theo dõi lớp học của bạn';
      case ROLE.TEACHER:
        return 'Quản lý và theo dõi các lớp học của bạn';
      case ROLE.ADMIN:
        return 'Tổng quan hệ thống và quản lý toàn bộ';
      default:
        return 'Quản lý lớp học';
    }
  };

  const getGradientClass = () => {
    switch (userRole) {
      case ROLE.STUDENT:
        return 'from-green-600 to-blue-600';
      case ROLE.TEACHER:
        return 'from-purple-600 to-blue-600';
      case ROLE.ADMIN:
        return 'from-indigo-600 to-purple-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 bg-gradient-to-r ${getGradientClass()} rounded-xl`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getTitle()}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">{getSubtitle()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {userRole === ROLE.STUDENT && (
              <Button
                size="sm"
                onClick={onQRScannerOpen}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <QrCode className="w-4 h-4" />
                <span>Quét QR</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}

            {userRole === ROLE.TEACHER && (
              <Button
                size="sm"
                onClick={onCreateClassOpen}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo lớp mới</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}

            {userRole === ROLE.ADMIN && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onCreateClassOpen}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo lớp</span>
                </Button>
                <Button
                  size="sm"
                  onClick={onQRScannerOpen}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Quét QR</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Tìm kiếm lớp học theo tên, mã lớp..."
              value={searchTerm}
              onChange={onSearchChange}
              delay={500}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;


