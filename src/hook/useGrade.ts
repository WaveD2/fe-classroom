import { useState, useEffect, useCallback } from 'react';
import { 
  Grade, 
  CreateGradeRequest, 
  UpdateGradeRequest, 
  StudentGradesResponse, 
  ClassGradeStatistics,
  GradeFilter
} from '../types';
import * as gradeApi from '../api/grade';

export const useGrades = (classId: string, filter?: GradeFilter) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchGrades = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.getClassGrades(classId, filter);
      setGrades(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách điểm');
    } finally {
      setLoading(false);
    }
  }, [classId, filter, pagination]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const createGrade = async (gradeData: CreateGradeRequest) => {
    try {
      const response = await gradeApi.createGrade(gradeData);
      await fetchGrades(); // Refresh the list
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateGrade = async (gradeId: string, gradeData: UpdateGradeRequest) => {
    try {
      const response = await gradeApi.updateGrade(gradeId, gradeData);
      await fetchGrades(); // Refresh the list
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteGrade = async (gradeId: string) => {
    try {
      await gradeApi.deleteGrade(gradeId);
      await fetchGrades(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    grades,
    loading,
    error,
    pagination,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade
  };
};

export const useStudentGrades = (classId: string, studentId: string) => {
  const [studentGrades, setStudentGrades] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentGrades = useCallback(async () => {
    if (!classId || !studentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.getStudentGrades(classId, studentId);
      setStudentGrades(response.data);
    } catch (err: any) {
      console.error('Error fetching student grades:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải điểm học sinh');
    } finally {
      setLoading(false);
    }
  }, [classId, studentId]);

  useEffect(() => {
    fetchStudentGrades();
  }, [fetchStudentGrades]);

  return {
    studentGrades,
    loading,
    error,
    fetchStudentGrades
  };
};

export const useClassGradeStatistics = (classId: string) => {
  const [statistics, setStatistics] = useState<ClassGradeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.getClassGradeStatistics(classId);
      setStatistics(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    fetchStatistics
  };
};

export const useMyGrades = (classId: string) => {
  const [myGrades, setMyGrades] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGrades = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.getMyGrades(classId);
      setMyGrades(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchMyGrades();
  }, [fetchMyGrades]);

  return {
    myGrades,
    loading,
    error,
    fetchMyGrades
  };
};

export const useGradeForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGrade = async (gradeData: CreateGradeRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.createGrade(gradeData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (gradeId: string, gradeData: UpdateGradeRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.updateGrade(gradeId, gradeData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateGrades = async (grades: CreateGradeRequest[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.bulkCreateGrades(grades);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createGrade,
    updateGrade,
    bulkCreateGrades
  };
};

export const useGradeExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportGrades = async (classId: string, filter?: GradeFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradeApi.exportGrades(classId, filter);
      
      // Create blob and download
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grades-${classId}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    exportGrades
  };
};
