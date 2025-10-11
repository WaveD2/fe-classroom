import { 
  CreateGradeRequest, 
  UpdateGradeRequest, 
  GradeFilter 
} from "../types";
import api from "./api";

// Create a new grade (Teacher/Admin only)
export const createGrade = async (gradeData: CreateGradeRequest) => {
  try {
    const response = await api.post("/grade", gradeData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi tạo điểm");
    }
    throw error;
  }
};

// Get grades for a specific student in a class
export const getStudentGrades = async (classId: string, studentId: string) => {
  try {
    const response = await api.get(`/grade/class/${classId}/student/${studentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy điểm học sinh");
    }
    throw error;
  }
};

// Get class grade statistics
export const getClassGradeStatistics = async (classId: string) => {
  try {
    const response = await api.get(`/grade/class/${classId}/statistics`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy thống kê điểm lớp");
    }
    throw error;
  }
};

// Update a grade
export const updateGrade = async (gradeId: string, gradeData: UpdateGradeRequest) => {
  try {
    const response = await api.put(`/grade/${gradeId}`, gradeData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi cập nhật điểm");
    }
    throw error;
  }
};

// Delete a grade
export const deleteGrade = async (gradeId: string) => {
  try {
    const response = await api.delete(`/grade/${gradeId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi xóa điểm");
    }
    throw error;
  }
};

// Get my grades (Student only)
export const getMyGrades = async (classId: string) => {
  try {
    const response = await api.get(`/grade/my-grades/${classId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy điểm của tôi");
    }
    throw error;
  }
};

// Get all grades for a class with filters
export const getClassGrades = async (classId: string, filter?: GradeFilter) => {
  try {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.gradeType) params.append('gradeType', filter.gradeType);
    if (filter?.search) params.append('search', filter.search);
    
    const response = await api.get(`/grade/class/${classId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy danh sách điểm lớp");
    }
    throw error;
  }
};

// Get grades by type in class
export const getGradesByType = async (classId: string, gradeType: string, filter?: GradeFilter) => {
  try {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.search) params.append('search', filter.search);
    
    const response = await api.get(`/grade/class/${classId}/type/${gradeType}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy điểm theo loại");
    }
    throw error;
  }
};

// Get grade by ID
export const getGradeById = async (gradeId: string) => {
  try {
    const response = await api.get(`/grade/${gradeId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi lấy thông tin điểm");
    }
    throw error;
  }
};

// Bulk create grades
export const bulkCreateGrades = async (grades: CreateGradeRequest[]) => {
  try {
    const response = await api.post("/grade/multiple", { grades });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi tạo điểm hàng loạt");
    }
    throw error;
  }
};

// Export grades to Excel
export const exportGrades = async (classId: string, filter?: GradeFilter) => {
  try {
    const params = new URLSearchParams();
    if (filter?.gradeType) params.append('gradeType', filter.gradeType);
    if (filter?.search) params.append('search', filter.search);
    
    const response = await api.get(`/grade/class/${classId}/export?${params.toString()}`, {
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi xuất điểm");
    }
    throw error;
  }
};
