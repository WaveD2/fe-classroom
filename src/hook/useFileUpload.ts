import { useState, useCallback } from 'react';
import { uploadFile } from '../api/upload';
import { validateFile } from '../utils/file.utils';
import type { UploadedFile } from '../types';

interface UseFileUploadReturn {
  upload: (file: File) => Promise<void>;
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadedFile | null;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const upload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const result = await uploadFile(file, setProgress);

    setUploading(false);
    console.log("result:::", result);
    
    if (result.success && result.data) {
      setUploadedFile(result.data);
    } else {
      setError(result.error || 'Upload failed');
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return { upload, uploading, progress, error, uploadedFile, reset };
};