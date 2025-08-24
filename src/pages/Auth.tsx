import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthForm = {
  email: string;
  password: string;
  name?: string;
  role?: string;
};

const Auth : React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthForm>({
    email: "",
    password: "",
    name: "",
    role: "student",
  });
  const [errors, setErrors] = useState<Partial<AuthForm>>({});
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = (): boolean => {
    const tempErrors: Partial<AuthForm> = {};

    if (isRegister && !form.name) {
      tempErrors.name = "Họ và tên không được để trống";
    } else if (isRegister && form.name && form.name.length < 5) {
      tempErrors.name = "Họ và tên tối thiểu 5 ký tự";
    }

    if (!form.email) {
      tempErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Email không hợp lệ";
    }

    if (!form.password) {
      tempErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 6) {
      tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (isRegister && !form.role) {
      tempErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setMessage("");
    setIsLoading(true);

    const endpoint = isRegister ? "/sign-up" : "/sign-in";
      
    try {
      const response = await fetch(`https://smashing-valid-jawfish.ngrok-free.app/api/user${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: isRegister? JSON.stringify(form) : JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();

      if (data && data?.status == 200) {
        setMessage(isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!");
        setForm({ email: "", password: "", name: "", role: "student" });
        if (data?.data?.data) {
          localStorage.setItem("user", JSON.stringify(data?.data?.data));
          localStorage.setItem(
            "accessToken",
            JSON.stringify(data?.data.tokens.accessToken.access)
          );
          localStorage.setItem(
            "refreshToken",
            JSON.stringify(data?.data.tokens.refreshToken.refresh)
          );
          navigate("/", { replace: true });
        }
      } else {
        setMessage(data.message || data.data?.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.log("error:::", error);
      setMessage("Lỗi kết nối tới server!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {isRegister ? "Đăng Ký" : "Đăng Nhập"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Họ và tên */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2">{errors.name}</p>
              )}
            </div>
          )}

          {/* Vai trò */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="student">Sinh viên</option>
                <option value="teacher">Giáo viên</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-2">{errors.role}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-2">{errors.password}</p>
            )}
          </div>

          {/* Nút Submit */}
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? isRegister
                ? "Đang đăng ký..."
                : "Đang đăng nhập..."
              : isRegister
              ? "Đăng Ký"
              : "Đăng Nhập"}
          </button>

          {/* Thông báo */}
          {message && (
            <p className="text-center mt-4 bg-green-50 text-green-600 p-3 rounded-lg">
              {message}
            </p>
          )}

          {/* Chuyển đổi */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrors({});
                setMessage("");
              }}
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
            >
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </button>
          </p>

          {/* Quên mật khẩu */}
          {!isRegister && (
            <p className="text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
              >
                Quên mật khẩu
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
