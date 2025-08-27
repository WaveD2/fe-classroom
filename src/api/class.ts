import { ClassI } from "../types";
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


export const getClass = async () => {
    const response = await api.get("/class");
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