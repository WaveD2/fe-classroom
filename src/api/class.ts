import { ClassI, ClassFilter } from "../types";
import api from "./api";

export const createClass = async (newClass: { name: string; code?: string }) => {
  try {
    const response = await api.post("/class", newClass);
    return response.data;
  } catch (error: any) {
    // nếu có response từ backend thì throw luôn message
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra");
    }
    throw error;
  }
};


export const getClass = async (filter?: ClassFilter) => {
  const params = new URLSearchParams();
  if (filter?.page) params.append('page', filter.page.toString());
  if (filter?.limit) params.append('limit', filter.limit.toString());
  if (filter?.search) params.append('search', filter.search);
  if (filter?.status) params.append('status', filter.status);
  
  const response = await api.get(`/class?${params.toString()}`);
  return response.data;
};


export const getClassDetail = async (classId: string) => {
  const response = await api.get(`/class/${classId}`);
  return response.data;
};

export const updateClass = async (classId: string, data: Partial<ClassI>) => {
  const response = await api.put(`/class/${classId}`, data);
  return response.data;
};


export const deleteClass = async (classId: string) => {
  const response = await api.delete(`/class/${classId}`);
  return response.data;
};

export const exportAttendanceClass = async (classId: string, filter?: Record<string, any>) => {
  const response = await api.get(`/class/${classId}/download`, { params: filter , responseType: "arraybuffer" });
  return response.data;
};

export const getClassByAdmin = async (filter?: ClassFilter) => {
  const params = new URLSearchParams();
  if (filter?.page) params.append('page', filter.page.toString());
  if (filter?.limit) params.append('limit', filter.limit.toString());
  if (filter?.search) params.append('search', filter.search);
  if (filter?.status) params.append('status', filter.status);
  
  const response = await api.get(`/class/by-admin?${params.toString()}`);
  return response.data;
};