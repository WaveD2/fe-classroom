import { useState, useRef } from 'react';
import { X, Upload, File, AlertCircle, Loader } from 'lucide-react';
import { uploadFile } from '../../api/upload';
import { uploadDocument } from '../../api/document';
import type { DocumentUploadRequest, DOCUMENT_STATUS } from '../../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSuccess?: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  classId,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DOCUMENT_STATUS>('public' as DOCUMENT_STATUS);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
  ];

  const maxSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Loại file không được hỗ trợ. Chỉ chấp nhận PDF, Word, Excel, PowerPoint, ZIP, RAR, TXT';
    }
    if (file.size > maxSize) {
      return 'Kích thước file không được vượt quá 50MB';
    }
    return null;
  };

  const getFileType = (file: File): string => {
    const mimeTypeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
      'text/plain': 'txt',
    };
    return mimeTypeMap[file.type] || 'unknown';
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setDocumentName(selectedFile.name);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    if (!documentName.trim()) {
      setError('Vui lòng nhập tên tài liệu');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Upload file to Cloudinary
      const uploadResult = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload file thất bại');
      }

      // Step 2: Save document info to database
      const documentData: DocumentUploadRequest = {
        name: documentName.trim(),
        size: file.size,
        type: getFileType(file),
        url: uploadResult.data.url,
        cloudinaryPublicId: uploadResult.data.public_id,
        classId,
        status,
        description: description.trim() || undefined,
      };

      await uploadDocument(documentData);

      // Success
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải tài liệu lên');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setDocumentName('');
    setDescription('');
    setStatus('public' as DOCUMENT_STATUS);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-900">Tải tài liệu lên</h3>
          <button 
            onClick={handleClose} 
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File tài liệu <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {!file ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Kéo thả file vào đây hoặc
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Chọn file
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    PDF, Word, Excel, PowerPoint, ZIP, RAR, TXT (max 50MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <File className="w-8 h-8 text-blue-500" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên tài liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={uploading}
              placeholder="Nhập tên tài liệu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="Nhập mô tả về tài liệu (không bắt buộc)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={status === 'public'}
                  onChange={(e) => setStatus(e.target.value as DOCUMENT_STATUS)}
                  disabled={uploading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Công khai (Tất cả học sinh)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={status === 'private'}
                  onChange={(e) => setStatus(e.target.value as DOCUMENT_STATUS)}
                  disabled={uploading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Riêng tư (Chỉ giáo viên)</span>
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đang tải lên...</span>
                <span className="font-medium text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <span>Tải lên</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;

