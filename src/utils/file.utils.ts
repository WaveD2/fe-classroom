import { UPLOAD_CONFIG } from '../constants';
import { FileType } from '../types';

export const getFileType = (mimeType: string): FileType | null => {
  if (UPLOAD_CONFIG.ALLOWED_IMAGES.includes(mimeType)) return 'image';
  if (UPLOAD_CONFIG.ALLOWED_DOCUMENTS.includes(mimeType)) return 'document';
  return null;
};

export const validateFile = (file: File): string | null => {
  const fileType = getFileType(file.type);
  
  if (!fileType) {
    return 'Định dạng file không được hỗ trỡ';
  }
  
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return `File upload phải nhỏ hơn ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
