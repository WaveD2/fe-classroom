import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, AlertCircle } from 'lucide-react';
import DocumentCard from './DocumentCard';
import PaginationBar from '../common/PaginationBar';
import LoadingState from '../loading/LoadingState';
import { Document, DocumentFilter, ROLE, DOCUMENT_STATUS } from '../../types';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userRole?: ROLE;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onFilterChange?: (filters: DocumentFilter) => void;
  onPageChange: (page: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  pagination,
  userRole,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onFilterChange,
  onPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DOCUMENT_STATUS | 'all'>('all');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalSearch(searchTerm);
      onFilterChange?.({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    onFilterChange?.({});
  };

  const canFilterPrivate = userRole !== ROLE.STUDENT;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Bộ lọc</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              className="w-full pl-10 pr-4 outline-0 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {canFilterPrivate && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DOCUMENT_STATUS | 'all')}
                className="w-full px-4 outline-0 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          )}
        </div>

        {(searchTerm || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Đang lọc:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Tìm kiếm: "{searchTerm}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {statusFilter === 'public' ? 'Công khai' : 'Riêng tư'}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Hiển thị {documents.length > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} tài liệu
          </span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            {localSearch || statusFilter !== 'all' ? (
              <>
                <AlertCircle className="w-16 h-16 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Không tìm thấy tài liệu
                </h3>
                <p className="text-gray-500 max-w-md">
                  Không có tài liệu nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </>
            ) : (
              <>
                <FileText className="w-16 h-16 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Chưa có tài liệu nào
                </h3>
                <p className="text-gray-500 max-w-md">
                  Lớp học này chưa có tài liệu nào. Giáo viên có thể tải tài liệu lên để chia sẻ với học sinh.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              userRole={userRole}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationBar
             page={pagination.page}
             totalPages={pagination.totalPages}
             total={pagination.total}
             limit={pagination.limit}
             onChangePage={onPageChange}
             onChangeLimit={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(DocumentList);

