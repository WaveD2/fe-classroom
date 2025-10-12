import { 
  GradeFilter,
  GradeData,
} from "../types";
import api from "./api";

// ===================================
// GRADE API - Theo đúng documentation
// ===================================

// 1. Cập nhật điểm thành phần (POST /class/:classId/grades)
// Có thể cập nhật 1 hoặc nhiều field cùng lúc
// KHÔNG tự động tính letterGrade và gpaValue
export const updateGradeComponent = async (
  classId: string, 
  studentId: string, 
  gradeData: Partial<GradeData>
) => {
  try {
    const response = await api.post(`/class/${classId}/grades`, {
      classId,
      studentId,
      ...gradeData
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi cập nhật điểm thành phần");
    }
    throw error;
  }
};

// 2. Tính điểm tổng kết cho 1 học sinh (POST /class/:classId/calculate-grades/:studentId)
// Yêu cầu phải có đầy đủ 4 điểm thành phần
export const calculateFinalGrade = async (classId: string, studentId: string) => {
  try {
    const response = await api.post(`/api/class/${classId}/calculate-grades/${studentId}`, {
      classId,
      studentId
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi tính điểm tổng kết");
    }
    throw error;
  }
};

// 3. Tính điểm tổng kết cho cả lớp (POST /api/class/:classId/calculate-grades)
// Tính cho tất cả học sinh có điểm thành phần
export const calculateFinalGradeClass = async (classId: string) => {
  try {
    const response = await api.post(`/class/${classId}/calculate-grades`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi tính điểm tổng kết cho lớp");
    }
    throw error;
  }
};

// 4. Xem điểm của 1 học sinh (GET /class/:classId/grades/:studentId)
export const getStudentGrade = async (classId: string, studentId: string) => {
  try {
    const response = await api.get(`/class/${classId}/grades/${studentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy điểm học sinh");
    }
    throw error;
  }
};

// 5. Xem danh sách điểm lớp (GET /class/:classId/grades)
// Hỗ trợ pagination và filter
export const getClassGrades = async (classId: string, filter?: GradeFilter) => {
  try {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.studentId) params.append('studentId', filter.studentId);
    
    const queryString = params.toString();
    const response = await api.get(`/class/${classId}/grades${queryString ? '?' + queryString : ''}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy danh sách điểm lớp");
    }
    throw error;
  }
};

// 6. Thống kê điểm lớp (GET /class/:classId/static-grades)
export const getClassGradeStatistics = async (classId: string) => {
  try {
    const response = await api.get(`/class/${classId}/static-grades`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy thống kê điểm lớp");
    }
    throw error;
  }
};

// 7. Xóa điểm (DELETE /class/:classId/:gradeId)
export const deleteGrade = async (classId: string, gradeId: string) => {
  try {
    const response = await api.delete(`/class/${classId}/${gradeId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi xóa điểm");
    }
    throw error;
  }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Bulk update grades - cập nhật nhiều học sinh cùng lúc (NEW API)
export const bulkUpdateGrades = async (
  classId: string, 
  grades: { studentId: string; gradeData: Partial<GradeData> }[]
) => {
  try {
    // Transform to API format
    const students = grades.map(({ studentId, gradeData }) => ({
      studentId,
      ...gradeData
    }));

    const response = await api.post(`/class/${classId}/grades/multiple`, {
      students
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi cập nhật điểm hàng loạt");
    }
    throw error;
  }
};

// ===================================
// EXCEL IMPORT/EXPORT
// ===================================

// Tải file Excel mẫu với danh sách học sinh
export const downloadExcelTemplate = async (classId: string) => {
  try {
    const response = await api.get(`/excel-grade/template/${classId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mau_diem_lop_${classId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi tải file mẫu");
    }
    throw error;
  }
};

// Upload file Excel điểm học sinh
export const uploadExcelGrades = async (classId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('excelFile', file);

    const response = await api.post(`/excel-grade/upload/${classId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi upload file Excel");
    }
    throw error;
  }
};
