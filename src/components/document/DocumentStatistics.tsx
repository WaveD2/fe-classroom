import { FileText, Globe, Lock, HardDrive, TrendingUp } from 'lucide-react';
import type { DocumentStatistics as DocumentStatsType } from '../../types';

interface DocumentStatisticsProps {
  statistics: DocumentStatsType | null;
  loading?: boolean;
}

const DocumentStatistics: React.FC<DocumentStatisticsProps> = ({
  statistics,
  loading = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      pdf: 'PDF',
      doc: 'Word (DOC)',
      docx: 'Word (DOCX)',
      xls: 'Excel (XLS)',
      xlsx: 'Excel (XLSX)',
      ppt: 'PowerPoint (PPT)',
      pptx: 'PowerPoint (PPTX)',
      zip: 'ZIP',
      rar: 'RAR',
      txt: 'Text',
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const getFileTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      pdf: 'bg-red-100 text-red-800 border-red-200',
      doc: 'bg-blue-100 text-blue-800 border-blue-200',
      docx: 'bg-blue-100 text-blue-800 border-blue-200',
      xls: 'bg-green-100 text-green-800 border-green-200',
      xlsx: 'bg-green-100 text-green-800 border-green-200',
      ppt: 'bg-orange-100 text-orange-800 border-orange-200',
      pptx: 'bg-orange-100 text-orange-800 border-orange-200',
      zip: 'bg-purple-100 text-purple-800 border-purple-200',
      rar: 'bg-purple-100 text-purple-800 border-purple-200',
      txt: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Không có dữ liệu thống kê
        </h3>
        <p className="text-gray-500">
          Chưa có thông tin thống kê về tài liệu của lớp học này.
        </p>
      </div>
    );
  }

  const publicPercentage = statistics.total > 0 
    ? ((statistics.publicCount / statistics.total) * 100).toFixed(1)
    : '0';
  const privatePercentage = statistics.total > 0
    ? ((statistics.privateCount / statistics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-70" />
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-90">Tổng tài liệu</p>
            <p className="text-3xl font-bold">{statistics.total}</p>
            <p className="text-xs opacity-75">file</p>
          </div>
        </div>

        {/* Public Documents */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              {publicPercentage}%
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-90">Công khai</p>
            <p className="text-3xl font-bold">{statistics.publicCount}</p>
            <p className="text-xs opacity-75">file</p>
          </div>
        </div>

        {/* Private Documents */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              {privatePercentage}%
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-90">Riêng tư</p>
            <p className="text-3xl font-bold">{statistics.privateCount}</p>
            <p className="text-xs opacity-75">file</p>
          </div>
        </div>

        {/* Total Size */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <HardDrive className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-90">Dung lượng</p>
            <p className="text-3xl font-bold">
              {formatFileSize(statistics.totalSize)}
            </p>
            <p className="text-xs opacity-75">tổng cộng</p>
          </div>
        </div>
      </div>

      {/* Documents by Type */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Phân loại theo định dạng
          </h3>
        </div>

        {statistics.documentsByType.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu phân loại
          </div>
        ) : (
          <div className="space-y-4">
            {statistics.documentsByType
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const percentage = statistics.total > 0
                  ? ((item.count / statistics.total) * 100).toFixed(1)
                  : '0';
                
                return (
                  <div key={item._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getFileTypeColor(item._id)}`}>
                          {getFileTypeLabel(item._id)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.count} file • {formatFileSize(item.totalSize)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Tổng số tài liệu</span>
              <span className="font-semibold text-gray-900">{statistics.total}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Tài liệu công khai</span>
              <span className="font-semibold text-green-600">{statistics.publicCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Tài liệu riêng tư</span>
              <span className="font-semibold text-orange-600">{statistics.privateCount}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Tổng dung lượng</span>
              <span className="font-semibold text-gray-900">
                {formatFileSize(statistics.totalSize)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Số loại file</span>
              <span className="font-semibold text-gray-900">
                {statistics.documentsByType.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Dung lượng trung bình</span>
              <span className="font-semibold text-gray-900">
                {statistics.total > 0
                  ? formatFileSize(Math.round(statistics.totalSize / statistics.total))
                  : '0 B'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatistics;


