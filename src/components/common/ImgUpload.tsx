import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FileValidation, UploadedFile } from "../../types";
import { useFileUpload } from "../../hook/useFileUpload";

interface AvatarUploadProps {
  defaultValue?: string; // URL của ảnh mặc định
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  onRemove?: () => void;
  validation?: Partial<FileValidation>;
  size?: 'sm' | 'md' | 'lg'; // 80px, 128px, 160px
  disabled?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  defaultValue,
  onUploadSuccess,
  onUploadError,
  onRemove,
  validation,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [hasChanged, setHasChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, uploading, error: uploadError, uploadedFile, reset } = useFileUpload();
  
  // Default validation
  const defaultValidation: FileValidation = {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    errorMessages: {
      type: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)',
      size: 'Kích thước file không được vượt quá 5MB'
    }
  };

  const mergedValidation = { ...defaultValidation, ...validation };

  // Update preview when defaultValue changes
  useEffect(() => {
    setPreview(defaultValue || null);
    setHasChanged(false);
  }, [defaultValue]);

  // Handle upload success
  useEffect(() => {
    if (uploadedFile && !uploadError) {
      onUploadSuccess?.(uploadedFile);
    }
  }, [uploadedFile, uploadError]);

  // Handle upload error
  useEffect(() => {
    if (uploadError) {
      onUploadError?.(uploadError);
      // Reset preview về ảnh mặc định khi upload lỗi
      setPreview(defaultValue || null);
      setHasChanged(false);
    }
  }, [uploadError, defaultValue, onUploadError]);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const validateImageFile = (file: File): string | null => {
    if (!mergedValidation.acceptedTypes.includes(file.type)) {
      return mergedValidation.errorMessages?.type || 'File type not supported';
    }
    if (file.size > mergedValidation.maxSize) {
      return mergedValidation.errorMessages?.size || 'File size too large';
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setHasChanged(true);
    };
    reader.readAsDataURL(file);

    // Upload file
    await upload(file);
  };

  const handleRemove = () => {
    setPreview(defaultValue || null);
    setHasChanged(false);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div
          onClick={handleClick}
          className={`${sizeClasses[size]} rounded-full border-2 border-dashed ${
            disabled ? 'border-gray-200 cursor-not-allowed' : 'border-gray-300 cursor-pointer hover:border-blue-500'
          } flex items-center justify-center transition-colors overflow-hidden bg-gray-50`}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Click to upload</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center gap-2 text-2xl text-gray-600 justify-center">
             <svg
                className="animate-spin h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          )}
        </div>
        
        {preview && !uploading && !disabled && hasChanged && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={mergedValidation.acceptedTypes.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 max-w-xs">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      {uploadedFile && !uploading && !uploadError && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 max-w-xs">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-700">Upload thành công!</p>
            <p className="text-xs text-green-600 mt-1 truncate">{uploadedFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};