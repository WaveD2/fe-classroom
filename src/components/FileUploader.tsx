import React, { useRef, ChangeEvent } from 'react';
import { useFileUpload } from '../hook/useFileUpload';
import type { UploadedFile
    
 } from '../types';
interface FileUploaderProps {
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
  accept?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onSuccess,
  onError,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress, error, uploadedFile } = useFileUpload();

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await upload(file);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (uploadedFile) onSuccess?.(uploadedFile);
    if (error) onError?.(error);
  }, [uploadedFile, error, onSuccess, onError]);

  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="upload-btn"
      >
        {uploading ? `Uploading ${progress}%` : 'Choose File'}
      </button>

      {error && <p className="error">{error}</p>}
      
      {uploadedFile && (
        <div className="preview">
          {uploadedFile.type === 'image' ? (
            <img src={uploadedFile.url} alt="Uploaded" />
          ) : (
            <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
              View Document
            </a>
          )}
        </div>
      )}
    </div>
  );
};