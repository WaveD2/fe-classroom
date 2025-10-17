import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Grade, 
  GradeData,
  StudentGradeResponse, 
  ClassGradeStatisticsResponse,
  ClassGradesResponse,
  GradeFilter,
  CalculateFinalGradeClassResponse,
  UpdateGradeComponentResponse,
  CalculateFinalGradeResponse
} from '../types';
import * as gradeApi from '../api/grade';
import { clearCacheByPrefix, deleteCacheByKey, getCacheKey, getFromCache, setToCache } from '../utils/core';

 

export const useGrades = (classId: string, filter?: GradeFilter) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: filter?.page || 1,
    limit: filter?.limit || 20,
    total: 0,
    totalPages: 0
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Create stable cache key
  const cacheKey = useMemo(
    () => getCacheKey(`grades-${classId}`, filter),
    [classId, filter]
  );

  // Fetch grades with caching
  const fetchGrades = useCallback(async (forceRefresh = false) => {
    if (!classId) return;

    // Check cache first
    if (!forceRefresh) {
      const cached = getFromCache<{ grades: Grade[]; pagination: typeof pagination }>(cacheKey);
      if (cached) {
        setGrades(cached.grades);
        setPagination(cached.pagination);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response: ClassGradesResponse = await gradeApi.getClassGrades(classId, filter);
      
      if (!isMounted.current) return;

      const gradesData = response.data.grades || [];
      const paginationData = response.data.pagination || pagination;

      setGrades(gradesData);
      setPagination(paginationData);

      // Update cache
      setToCache(cacheKey, { grades: gradesData, pagination: paginationData });
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching grades:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách điểm');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [classId, filter, cacheKey, pagination]);

  // Update grade component with optimistic update
  const updateGradeComponent = useCallback(async (
    studentId: string, 
    gradeData: Partial<GradeData>
  ) => {
    const previousGrades = [...grades];

    // Optimistic update
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.studentId._id === studentId 
          ? { ...grade, ...gradeData, updatedAt: new Date().toISOString() }
          : grade
      )
    );

    try {
      const response: UpdateGradeComponentResponse = await gradeApi.updateGradeComponent(
        classId, 
        studentId, 
        gradeData
      );

      if (!isMounted.current) return response;

      setGrades(prevGrades => {
        const gradeExists = prevGrades.some(g => g.studentId._id === studentId);
        
        if (gradeExists) {
          return prevGrades.map(grade => 
            grade.studentId._id === studentId ? response.data : grade
          );
        } else {
          return [...prevGrades, response.data];
        }
      });

      clearCacheByPrefix(`grades-${classId}`);

      return response;
    } catch (err: any) {
      if (!isMounted.current) throw err;

      setGrades(previousGrades);
      setError(err.message);
      throw err;
    }
  }, [classId, grades]);

  const calculateFinalGrade = useCallback(async (studentId: string) => {
    try {
      const response: CalculateFinalGradeResponse = await gradeApi.calculateFinalGrade(
        classId, 
        studentId
      );

      if (!isMounted.current) return response;

      // Update the grade with calculated values
      setGrades(prevGrades => 
        prevGrades.map(grade => 
          grade.studentId._id === studentId ? response.data : grade
        )
      );

      // Clear cache
      clearCacheByPrefix(`grades-${classId}`);

      return response;
    } catch (err: any) {
      if (!isMounted.current) throw err;
      setError(err.message);
      throw err;
    }
  }, [classId]);

  // Calculate final grade for entire class
  const calculateFinalGradeClass = useCallback(async () => {
    try {
      const response: CalculateFinalGradeClassResponse = await gradeApi.calculateFinalGradeClass(classId);

      if (!isMounted.current) return response;

      // Update all grades with calculated data
      setGrades(prevGrades => {
        const updatedGradesMap = new Map(
          response.data.grades.map(g => [g.studentId._id, g])
        );

        return prevGrades.map(grade => 
          updatedGradesMap.get(grade.studentId._id) || grade
        );
      });

      // Clear cache
      clearCacheByPrefix(`grades-${classId}`);

      return response;
    } catch (err: any) {
      if (!isMounted.current) throw err;
      setError(err.message);
      throw err;
    }
  }, [classId]);

  // Delete grade with optimistic update
  const deleteGrade = useCallback(async (gradeId: string) => {
    const previousGrades = [...grades];

    // Optimistic update
    setGrades(prevGrades => prevGrades.filter(grade => grade._id !== gradeId));

    try {
      await gradeApi.deleteGrade(classId, gradeId);

      // Clear cache
      clearCacheByPrefix(`grades-${classId}`);
    } catch (err: any) {
      if (!isMounted.current) throw err;

      // Revert on error
      setGrades(previousGrades);
      setError(err.message);
      throw err;
    }
  }, [classId, grades]);

  useEffect(() => {
    fetchGrades();
  }, [classId, filter?.page, filter?.limit, filter?.studentId]);

  return {
    grades,
    loading,
    error,
    pagination,
    refetch: () => fetchGrades(true),
    updateGradeComponent,
    calculateFinalGrade,
    calculateFinalGradeClass,
    deleteGrade
  };
};

// ===================================
// HOOK: useStudentGrade - Quản lý điểm của 1 học sinh
// ===================================
export const useStudentGrade = (classId: string, studentId: string) => {
  const [studentGrade, setStudentGrade] = useState<StudentGradeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const cacheKey = useMemo(
    () => `grade-${classId}-${studentId}`,
    [classId, studentId]
  );

  const fetchStudentGrade = useCallback(async (forceRefresh = false) => {
    if (!classId || !studentId) return;

    // Check cache
    if (!forceRefresh) {
      const cached = getFromCache<StudentGradeResponse>(cacheKey);
      if (cached) {
        setStudentGrade(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response: StudentGradeResponse = await gradeApi.getStudentGrade(classId, studentId);
      
      if (!isMounted.current) return;

      setStudentGrade(response);
      setToCache(cacheKey, response);
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching student grade:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải điểm học sinh');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [classId, studentId, cacheKey]);

  const updateGradeComponent = useCallback(async (gradeData: Partial<GradeData>) => {
    try {
      const response: UpdateGradeComponentResponse = await gradeApi.updateGradeComponent(
        classId, 
        studentId, 
        gradeData
      );

      if (!isMounted.current) return response;

      // Update local state
      setStudentGrade(prev => {
        if (!prev) return null;
        return {
          ...prev,
          data: {
            ...prev.data,
            grade: response.data
          }
        };
      });

      // Clear cache
      deleteCacheByKey(cacheKey);
      clearCacheByPrefix(`grades-${classId}`);

      return response;
    } catch (err: any) {
      if (!isMounted.current) throw err;
      setError(err.message);
      throw err;
    }
  }, [classId, studentId, cacheKey]);

  const calculateFinalGrade = useCallback(async () => {
    try {
      const response: CalculateFinalGradeResponse = await gradeApi.calculateFinalGrade(
        classId, 
        studentId
      );

      if (!isMounted.current) return response;

      // Update local state
      setStudentGrade(prev => {
        if (!prev) return null;
        return {
          ...prev,
          data: {
            ...prev.data,
            grade: response.data
          }
        };
      });

      // Clear cache
      deleteCacheByKey(cacheKey);
      clearCacheByPrefix(`grades-${classId}`);

      return response;
    } catch (err: any) {
      if (!isMounted.current) throw err;
      setError(err.message);
      throw err;
    }
  }, [classId, studentId, cacheKey]);

  useEffect(() => {
    fetchStudentGrade();
  }, [classId, studentId]);

  return {
    studentGrade,
    loading,
    error,
    refetch: () => fetchStudentGrade(true),
    updateGradeComponent,
    calculateFinalGrade
  };
};

// ===================================
// HOOK: useClassGradeStatistics - Thống kê điểm lớp
// ===================================
export const useClassGradeStatistics = (classId: string) => {
  const [statistics, setStatistics] = useState<ClassGradeStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const cacheKey = useMemo(
    () => `statistics-${classId}`,
    [classId]
  );

  const fetchStatistics = useCallback(async (forceRefresh = false) => {
    if (!classId) return;

    // Check cache
    if (!forceRefresh) {
      const cached = getFromCache<ClassGradeStatisticsResponse>(cacheKey);
      if (cached) {
        setStatistics(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response: ClassGradeStatisticsResponse = await gradeApi.getClassGradeStatistics(classId);
      
      if (!isMounted.current) return;

      setStatistics(response);
      setToCache(cacheKey, response);
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [classId, cacheKey]);

  useEffect(() => {
    fetchStatistics();
  }, [classId]);

  return {
    statistics,
    loading,
    error,
    refetch: () => fetchStatistics(true)
  };
};

// ===================================
// HOOK: useGradeForm - Form operations (no state management)
// ===================================
export const useGradeForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGradeComponent = useCallback(async (
    classId: string, 
    studentId: string, 
    gradeData: Partial<GradeData>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await gradeApi.updateGradeComponent(classId, studentId, gradeData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateFinalGrade = useCallback(async (classId: string, studentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await gradeApi.calculateFinalGrade(classId, studentId);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateFinalGradeClass = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await gradeApi.calculateFinalGradeClass(classId);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateGrades = useCallback(async (
    classId: string, 
    grades: { studentId: string; gradeData: Partial<GradeData> }[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await gradeApi.bulkUpdateGrades(classId, grades);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateGradeComponent,
    calculateFinalGrade,
    calculateFinalGradeClass,
    bulkUpdateGrades
  };
};
