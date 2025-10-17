import { FileText, Download, Edit, Trash2, Eye, Lock, Globe, Calendar, User } from 'lucide-react';
import type { Document, ROLE } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DocumentCardProps {
  document: Document;
  userRole?: ROLE;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  userRole,
  onView,
  onEdit,
  onDelete,
  onDownload,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'ppt':
      case 'pptx':
        return <FileText className={`${iconClass} text-orange-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      pdf: 'PDF',
      doc: 'Word',
      docx: 'Word',
      xls: 'Excel',
      xlsx: 'Excel',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
      zip: 'ZIP',
      rar: 'RAR',
      txt: 'Text',
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const uploadBy = typeof document.uploadBy === 'object' ? document.uploadBy : null;
  const canEdit = userRole !== 'student';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getFileIcon(document.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 
                className="text-base font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                onClick={() => onView?.(document)}
                title={document.name}
              >
                {document.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-gray-500">
                  {getFileTypeLabel(document.type)} • {formatFileSize(document.size)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  document.status === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {document.status === 'public' ? (
                    <>
                      <Globe className="w-3 h-3" />
                      Công khai
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Riêng tư
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {document.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            {uploadBy && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{uploadBy.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {document.createdAt 
                  ? formatDistanceToNow(new Date(document.createdAt), { 
                      addSuffix: true, 
                      locale: vi 
                    })
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView?.(document)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Xem</span>
            </button>
            <button
              onClick={() => onDownload?.(document)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống</span>
            </button>
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(document)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Sửa</span>
              </button>
            )}
            {canEdit && onDelete && (
              <button
                onClick={() => onDelete(document)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

