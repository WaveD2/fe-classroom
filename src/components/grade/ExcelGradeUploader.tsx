import { useState, useRef, memo } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader2,
  FileText
} from 'lucide-react';
import Button from '../common/Button';
import { showSuccess, showError } from '../Toast';
import * as gradeApi from '../../api/grade';

interface ExcelGradeUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
  onSuccess: () => void;
}

/**
 * ExcelGradeUploader - Component upload điểm từ Excel
 * 
 * Features:
 * 1. Tải file mẫu Excel
 * 2. Upload file Excel với validation
 * 3. Hiển thị progress và kết quả
 * 4. Drag & drop support
 */

const ExcelGradeUploader = memo(({ 
  isOpen, 
  onClose, 
  classId,
  className,
  onSuccess 
}: ExcelGradeUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Excel template
  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await gradeApi.downloadExcelTemplate(classId);
      showSuccess('Đã tải file mẫu thành công');
    } catch (error: any) {
      showError(error.message || 'Không thể tải file mẫu');
    } finally {
      setDownloading(false);
    }
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'File phải có định dạng .xlsx hoặc .xls';
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File không được vượt quá 5MB';
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      showError(error);
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag & drop
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
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Vui lòng chọn file Excel');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await gradeApi.uploadExcelGrades(classId, selectedFile);
      setUploadResult(result);
      
      if (result.success) {
        showSuccess(`Đã cập nhật điểm cho ${result.data?.updatedCount || 0} học sinh`);
        onSuccess();
        
        // Auto close after 2 seconds on success
        setTimeout(() => {
          onClose();
          handleReset();
        }, 2000);
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi upload file');
      setUploadResult({
        success: false,
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={uploading ? undefined : onClose} 
      />
      
      <div className={`absolute inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl ${className || ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Import điểm từ Excel</h2>
              <p className="text-sm text-gray-600">Tải file mẫu và upload điểm hàng loạt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Tải file Excel mẫu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  File mẫu đã có sẵn danh sách học sinh trong lớp. Bạn chỉ cần điền điểm vào các cột tương ứng.
                </p>
                <Button
                  onClick={handleDownloadTemplate}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Tải file mẫu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Upload file Excel đã điền điểm</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chọn hoặc kéo thả file Excel (.xlsx, .xls) vào khu vực bên dưới.
                </p>

                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 bg-white hover:border-green-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileInputChange}
                    disabled={uploading}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-12 h-12 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        disabled={uploading}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Chọn file khác
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-900 font-medium mb-1">
                          Kéo thả file vào đây hoặc
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          chọn file từ máy tính
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ: .xlsx, .xls (tối đa 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className={`rounded-xl p-4 ${
              uploadResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {uploadResult.message || (uploadResult.success ? 'Upload thành công!' : 'Upload thất bại')}
                  </p>
                  {uploadResult.data && (
                    <div className="mt-2 text-sm space-y-1">
                      {uploadResult.data.updatedCount !== undefined && (
                        <p className="text-green-700">
                          ✓ Đã cập nhật: {uploadResult.data.updatedCount} học sinh
                        </p>
                      )}
                      {uploadResult.data.failedCount !== undefined && uploadResult.data.failedCount > 0 && (
                        <p className="text-orange-700">
                          ⚠ Thất bại: {uploadResult.data.failedCount} học sinh
                        </p>
                      )}
                      {/* {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                        <div className="mt-2 p-2 bg-white rounded border border-red-200">
                          <p className="font-medium text-red-900 text-xs mb-1">Chi tiết lỗi:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {uploadResult.data.errors.slice(0, 5).map((err: string, idx: number) => (
                              <li key={idx}>• {err}</li>
                            ))}
                            {uploadResult.data.errors.length > 5 && (
                              <li>... và {uploadResult.data.errors.length - 5} lỗi khác</li>
                            )}
                          </ul>
                        </div>
                      )} */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedFile ? (
              <span className="text-green-600 font-medium">✓ File đã chọn</span>
            ) : (
              <span>Chưa chọn file</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              {uploadResult?.success ? 'Đóng' : 'Hủy'}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="min-w-[120px]"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang upload...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload điểm
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ExcelGradeUploader.displayName = 'ExcelGradeUploader';

export default ExcelGradeUploader;

