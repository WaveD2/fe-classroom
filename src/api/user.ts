import api from "./api";
import { User, PaginationInfo } from "../types";

export const getStudents = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/user/students", { params });
  return response.data as { status: number; data: User[]; pagination: PaginationInfo };
};

export const getTeachers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/user/teachers", { params });
  return response.data as { status: number; data: User[]; pagination: PaginationInfo };
};

export const getStudentById = async (id: string) => {
  const response = await api.get(`/user/students/${id}`);
  return response.data as { status: number; data: any };
};

export const getTeacherById = async (id: string) => {
  const response = await api.get(`/user/teachers/${id}`);
  return response.data as { status: number; data: any };
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/user/delete/${id}`);
  return response.data as { status: number; data: any };
};

export const createStudent = async (studentData: {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  dateOfBirth: string;
  role: string;
}) => {
  const response = await api.post("/user/students", studentData);
  return response.data as { success: boolean; data: User; message?: string };
};

export const createTeacher = async (teacherData: {
  name: string;
  email: string;
  phone: string;
  teacherId: string;
  dateOfBirth: string;
  subject: string;
  experience: number;
  role: string;
}) => {
  const response = await api.post("/user/teachers", teacherData);
  return response.data as { success: boolean; data: User; message?: string };
};


