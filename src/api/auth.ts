import api from "./api";
import { User } from "../types";

export const logout = async () => {
  const response = await api.post("/user/logout");
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return response.data;
};

export const updateProfile = async (userData: Partial<User>) => {
  try {
    const response = await api.put("/user", userData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
    throw error;
  }
};

export const updateUser = async (id : string, userData: Partial<User>) => {
  try {
    console.log("id::", id);
    
    const response = await api.patch(`/user/update-user/${id}`, userData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
    throw error;
  }
};
