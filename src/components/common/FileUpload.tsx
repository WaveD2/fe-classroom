import { useEffect, useRef, useState } from "react";
import { FileValidation, UploadedFile } from "../../types";
import { AlertCircle, File, FileText, Upload, X } from "lucide-react";

interface DocumentUploadProps {
    defaultFiles?: UploadedFile[]; // Danh sách file mặc định
    onUploadSuccess?: (file: UploadedFile) => void;
    onUploadError?: (error: string) => void;
    onRemove?: (fileId: string) => void;
    onFilesChange?: (files: UploadedFile[]) => void;
    validation?: Partial<FileValidation>;
    multiple?: boolean;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
    showUploadedList?: boolean;
  }
  
  export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    defaultFiles = [],
    onUploadError,
    onRemove,
    onFilesChange,
    validation,
    multiple = false,
    maxFiles = 10,
    disabled = false,
    className = '',
    showUploadedList = true
  }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultFiles);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    // Default validation
    const defaultValidation: FileValidation = {
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      errorMessages: {
        type: 'Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)',
        size: 'Kích thước file không được vượt quá 10MB'
      }
    };
  
    const mergedValidation = { ...defaultValidation, ...validation };
  
    useEffect(() => {
      setUploadedFiles(defaultFiles);
    }, [defaultFiles]);
  
    useEffect(() => {
      onFilesChange?.(uploadedFiles);
    }, [uploadedFiles, onFilesChange]);
  
    const validateDocumentFile = (file: File): string | null => {
      if (!mergedValidation.acceptedTypes.includes(file.type)) {
        return mergedValidation.errorMessages?.type || 'File type not supported';
      }
      if (file.size > mergedValidation.maxSize) {
        return mergedValidation.errorMessages?.size || 'File size too large';
      }
      if (uploadedFiles.length >= maxFiles) {
        return `Chỉ được upload tối đa ${maxFiles} file`;
      }
      return null;
    };
  
    const handleFileUpload = async (file: File) => {
      const validationError = validateDocumentFile(file);
      if (validationError) {
        setError(validationError);
        onUploadError?.(validationError);
        return;
      }
  
      setUploading(true);
      setError(null);
      setProgress(0);
  
    //   const result = await mockUpload(file, setProgress);
  
    //   setUploading(false);
  
    //   if (result.success && result.data) {
    //     setUploadedFiles(prev => [...prev, result.data!]);
    //     onUploadSuccess?.(result.data);
    //   } else {
    //     const errorMsg = result.error || 'Upload thất bại';
    //     setError(errorMsg);
    //     onUploadError?.(errorMsg);
    //   }
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  
    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      
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
  
      if (disabled) return;
  
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
  
    const handleRemove = (id: string) => {
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      onRemove?.(id);
    };
  
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
  
    const getFileIcon = (type: string) => {
      if (type === 'application/pdf') {
        return <FileText className="w-6 h-6 text-red-500" />;
      }
      return <File className="w-6 h-6 text-blue-500" />;
    };
  
    return (
      <div className={className}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            disabled 
              ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
              : dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <Upload className={`w-12 h-12 mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              Kéo thả file vào đây hoặc
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Chọn file
            </button>
            <p className="text-sm text-gray-500 mt-3">
              {mergedValidation.acceptedTypes.includes('application/pdf') && 'PDF'}
              {mergedValidation.acceptedTypes.includes('application/msword') && ', DOC, DOCX'}
              {' '}(max {(mergedValidation.maxSize / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </div>
  
          <input
            ref={fileInputRef}
            type="file"
            accept={mergedValidation.acceptedTypes.join(',')}
            onChange={handleFileChange}
            disabled={disabled}
            multiple={multiple}
            className="hidden"
          />
        </div>
  
        {uploading && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Đang upload...</span>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
  
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
  
        {showUploadedList && uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </h3>
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() => handleRemove(file.id)}
                    className="ml-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };