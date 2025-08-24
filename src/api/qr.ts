import { QrI } from "../types";
import api from "./api";

export const createQR = async (newQR: QrI) => {
    try {
      const response = await api.post("/qr", newQR);
      return response.data;
    } catch (error: any) {
      // nếu có response từ backend thì throw luôn message
      if (error.response) {
        throw new Error(error.response.data.message || "Có lỗi xảy ra");
      }
      throw error;
    }
  };


  export const getAllQR = async (query: Record<string, any>) => {
    try {
      const response = await api.get("/qr", { params: query });
      return response.data;
    } catch (error: any) {
      // nếu có response từ backend thì throw luôn message
      if (error.response) {
        throw new Error(error.response.data.message || "Có lỗi xảy ra");
      }
      throw error;
    }
  };

  export const diemDanh = async (infoQR: Record<string, any>) => {
    try {
      const response = await api.post("/qr/history", infoQR);
      return response.data;
    } catch (error: any) {
      // nếu có response từ backend thì throw luôn message
      if (error.response) {
        throw new Error(error.response.data.message || "Có lỗi xảy ra");
      }
      throw error;
    }
  };
  