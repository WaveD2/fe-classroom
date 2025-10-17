import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getDocumentsByClass, 
  getDocumentStatistics,
  deleteDocument as deleteDocumentAPI 
} from '../api/document';
import type { Document, DocumentFilter, DocumentStatistics } from '../types';
import { 
  getCacheKey, 
  getFromCache, 
  setToCache, 
  clearCacheByPrefix 
} from '../utils/core';
import { showSuccess, showError } from '../components/Toast';  
import { showInfo } from '../components/Toast';

export const useDocuments = (classId: string, filters?: DocumentFilter) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const cacheKey = useMemo(
    () => getCacheKey(`documents-${classId}`, filters),
    [classId, filters]
  );

  const fetchDocuments = useCallback(async (forceRefresh = false) => {
    if (!classId) return;
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cachedData = getFromCache<{ documents: Document[]; pagination: any }>(cacheKey);
        if (cachedData) {
          setDocuments(cachedData.documents);
          setPagination(cachedData.pagination);
          setLoading(false);
          return;
        }
      }

      const response = await getDocumentsByClass(classId, filters);
      if (response.success && response.data) {
        const { documents, pagination } = response.data;
        setDocuments(documents);
        setPagination(pagination);
        setToCache(cacheKey, { documents, pagination });
       } else {
        throw new Error("Không thể tải danh sách tài liệu");
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  }, [classId, filters, cacheKey]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await deleteDocumentAPI(documentId);

      clearCacheByPrefix(`documents-${classId}`);

      showSuccess("Xoá tài liệu thành công!");

      await fetchDocuments(true);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      showError(err.message || "Không thể xoá tài liệu");
      throw err;
    }
  }, [classId, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    pagination,
    refetch: fetchDocuments,
    deleteDocument,
  };
};

export const useDocumentStatistics = (classId: string) => {
  const [statistics, setStatistics] = useState<DocumentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(
    () => getCacheKey(`document-stats-${classId}`),
    [classId]
  );

  const fetchStatistics = useCallback(async (forceRefresh = false) => {
    if (!classId) return;
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cachedData = getFromCache<DocumentStatistics>(cacheKey);
        if (cachedData) {
          setStatistics(cachedData);
          showInfo("Đang hiển thị thống kê từ cache ⚡", { autoClose: 1500 });
          setLoading(false);
          return;
        }
      }

      const response = await getDocumentStatistics(classId);
      if (response.success && response.data) {
        setStatistics(response.data);
        setToCache(cacheKey, response.data);
        showSuccess("Tải thống kê tài liệu thành công!");
      } else {
        throw new Error("Không thể tải thống kê");
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải thống kê tài liệu');
      showError(err.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  }, [classId, cacheKey]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};
