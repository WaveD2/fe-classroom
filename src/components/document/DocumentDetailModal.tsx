import { X, Download, Calendar, User, FileText, Globe, Lock, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Document } from '../../types';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload?: (document: Document) => void;
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  onDownload,
}) => {
  if (!isOpen || !document) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      pdf: 'PDF Document',
      doc: 'Word Document (DOC)',
      docx: 'Word Document (DOCX)',
      xls: 'Excel Spreadsheet (XLS)',
      xlsx: 'Excel Spreadsheet (XLSX)',
      ppt: 'PowerPoint Presentation (PPT)',
      pptx: 'PowerPoint Presentation (PPTX)',
      zip: 'ZIP Archive',
      rar: 'RAR Archive',
      txt: 'Text File',
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const uploadBy = typeof document.uploadBy === 'object' ? document.uploadBy : null;
  const classInfo = typeof document.classId === 'object' ? document.classId : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết tài liệu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document Name */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">
                {document.name}
              </h4>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              {getFileTypeLabel(document.type)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              document.status === 'public' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {document.status === 'public' ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Công khai - Tất cả học sinh có thể xem</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Riêng tư - Chỉ giáo viên có thể xem</span>
                </>
              )}
            </span>
          </div>

          {/* Description */}
          {document.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {document.description}
              </p>
            </div>
          )}

          {/* File Info */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-semibold text-blue-900 mb-3">
              Thông tin file
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700">Dung lượng</p>
                  <p className="text-sm font-medium text-blue-900">
                    {formatFileSize(document.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700">Định dạng</p>
                  <p className="text-sm font-medium text-blue-900">
                    {document.type.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Info */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Thông tin tải lên</h5>
            <div className="space-y-2">
              {uploadBy && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Người tải lên</p>
                    <p className="text-sm font-medium text-gray-900">{uploadBy.name}</p>
                    <p className="text-xs text-gray-500">{uploadBy.email}</p>
                  </div>
                </div>
              )}
              {document.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ngày tải lên</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                </div>
              )}
              {classInfo && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Lớp học</p>
                    <p className="text-sm font-medium text-gray-900">
                      {classInfo.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Mã lớp: {classInfo.uniqueCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => onDownload?.(document)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailModal;

