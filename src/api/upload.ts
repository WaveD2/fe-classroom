import  { AxiosProgressEvent } from 'axios';
import { UPLOAD_CONFIG } from '../constants';
import { UploadResponse, MultipleUploadResponse } from '../types';
import api from "./api";

export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await api.post<UploadResponse>(
      "/upload",
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) {
            const progress = Math.round((e.loaded * 100) / e.total);
            onProgress?.(progress);
          }
        },
      }
    );
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Upload failed',
    };
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  try {
    const { data } = await api.post<MultipleUploadResponse>(
      `${UPLOAD_CONFIG.API_URL}/upload/multiple`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) {
            const progress = Math.round((e.loaded * 100) / e.total);
            onProgress?.(progress);
          }
        },
      }
    );
    return data;
  } catch (error: any) {
    return {
      success: false,
      errors: [error.response?.data?.error || 'Upload failed'],
    };
  }
};

export const deleteFile = async (publicId: string): Promise<UploadResponse> => {
  try {
    const { data } = await api.delete<UploadResponse>(
      `${UPLOAD_CONFIG.API_URL}/upload/${encodeURIComponent(publicId)}`
    );
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Delete failed',
    };
  }
};