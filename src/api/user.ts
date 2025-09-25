import api from "./api";
import { User, PaginationInfo } from "../types";

export const getStudents = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/user/students", { params });
  // Backend shape: { status, data: User[], pagination }
  return response.data as { status: number; data: User[]; pagination: PaginationInfo };
};

export const getTeachers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/user/teachers", { params });
  return response.data as { status: number; data: User[]; pagination: PaginationInfo };
};

export const getStudentById = async (id: string) => {
  const response = await api.get(`/user/students/${id}`);
  // Backend shape: { status, data: { ... } }
  return response.data as { status: number; data: any };
};

export const getTeacherById = async (id: string) => {
  const response = await api.get(`/user/teachers/${id}`);
  // Backend shape: { status, data: { ... } }
  return response.data as { status: number; data: any };
};


