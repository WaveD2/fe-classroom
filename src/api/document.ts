import api from "./api";
import type { 
  Document, 
  DocumentUploadRequest, 
  DocumentFilter, 
  DocumentStatistics,
  PaginatedResponse 
} from "../types";

// Upload document
export const uploadDocument = async (data: DocumentUploadRequest) => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Document;
    }>('/documents/upload', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get documents by class
export const getDocumentsByClass = async (
  classId: string, 
  filters?: DocumentFilter
) => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get<{
      success: boolean;
      data: {
        documents: Document[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(`/documents/class/${classId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get document statistics
export const getDocumentStatistics = async (classId: string) => {
  try {
    const response = await api.get<{
      success: boolean;
      data: DocumentStatistics;
    }>(`/documents/class/${classId}/statistics`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get documents by user
export const getDocumentsByUser = async (
  userId: string,
  filters?: DocumentFilter
) => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{
      success: boolean;
      data: {
        documents: Document[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(`/documents/user/${userId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get document by ID
export const getDocumentById = async (documentId: string) => {
  try {
    const response = await api.get<{
      success: boolean;
      data: Document;
    }>(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Update document
export const updateDocument = async (
  documentId: string,
  data: Partial<{
    name: string;
    description: string;
    status: string;
  }>
) => {
  try {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Document;
    }>(`/documents/${documentId}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Delete document
export const deleteDocument = async (documentId: string) => {
  try {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

