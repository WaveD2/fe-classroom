import api from "./api";

export const logout = async () => {
  const response = await api.post("/user/logout");
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return response.data;
};
