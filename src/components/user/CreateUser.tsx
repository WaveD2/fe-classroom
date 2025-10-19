import { useState, useCallback, useMemo, memo } from "react";
import { User, Mail, Phone, UserCircle, CheckCircle2, X, Lock } from "lucide-react";
import { ROLE, User as UserType } from "../../types";
import FormInput from "../common/FormInput";
import { showError } from "../Toast";


interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  // subject?: string;
  experience?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit:  (data: UserType) => Promise<any>;
  initialData?: Partial<UserType>;
  roleUser: ROLE;
}

const roleOptions = [
  { value: ROLE.STUDENT, label: "Học sinh", icon: "🎓", color: "blue" },
  { value: ROLE.TEACHER, label: "Giáo viên", icon: "👨‍🏫", color: "green" },
  // { value: ROLE.ADMIN, label: "Quản trị viên", icon: "👨‍💼", color: "purple" },
];

const RoleButton = memo(({ option, isSelected, onClick }: any) => {
  const getRoleColor = (role: ROLE) => {
    switch (role) {
      case ROLE.STUDENT:
        return "bg-blue-50 border-blue-200 text-blue-700";
      case ROLE.TEACHER:
        return "bg-green-50 border-green-200 text-green-700";
      case ROLE.ADMIN:
        return "bg-purple-50 border-purple-200 text-purple-700";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? getRoleColor(option.value) + " shadow-md scale-105"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="text-2xl mb-1">{option.icon}</div>
      <div className="text-sm font-semibold">{option.label}</div>
    </button>
  );
});



const CreateUserModal = ({ isOpen, onClose, onSubmit, initialData , roleUser }: CreateUserModalProps) => {
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: roleUser,
    ...initialData,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateField = useCallback((name: string, value: any): string | undefined => {
    
    switch (name) {
      case "name":
        if (!value || value.trim().length === 0) return "Họ tên không được để trống";
        if (value.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
        if (value.length > 100) return "Họ tên không được vượt quá 100 ký tự";
        return undefined;

      case "email":
        { if (!value || value.trim().length === 0) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không đúng định dạng";
        return undefined; }

      case "phone":
        { if (!value || value.trim().length === 0) return "Số điện thoại không được để trống";
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) return "Số điện thoại không đúng định dạng (VD: 0912345678)";
        return undefined; }
      
      case "password":
        { if (!value || value.trim().length === 0) return "Mật khẩu không đúng";
          if (value.trim().length <= 5) return "Mật khẩu tối thiểu 6 ký tự";
        return undefined; }

      // case "dateOfBirth":
      //   if (value) {
      //     const birthDate = new Date(value);
      //     const today = new Date();
      //     const age = today.getFullYear() - birthDate.getFullYear();
      //     if (age < 5 || age > 100) return "Tuổi phải từ 5 đến 100";
      //   }
      //   return undefined;

      // case "subject":
      //   if (currentRole === ROLE.TEACHER && (!value || value.trim().length === 0)) return "Giáo viên phải có môn giảng dạy";
      //   if (value && value.length > 100) return "Môn học không được vượt quá 100 ký tự";
      //   return undefined;

      // case "experience":
      //   if (currentRole === ROLE.TEACHER && !value) return "Giáo viên phải có kinh nghiệm";
      //   if (value !== undefined && (value < 0 || value > 50)) return "Kinh nghiệm phải từ 0 đến 50 năm";
      //   return undefined;

      default:
        return undefined;
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: Partial<UserType>) => {
      const newData = {
        ...prev,
        [name]: name === "experience" ? (value ? Number(value) : undefined) : value,
      };
      return newData;
    });

    setTouched((prev) => {
      if (prev[name]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validateField(name, value),
        }));
      }
      return prev;
    });
  }, [formData.role, validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  }, [formData.role, validateField]);

  const handleRoleChange = useCallback((role: ROLE) => {
    setFormData((prev: Partial<UserType>) => ({ ...prev, role }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof UserType>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
    });

    return isValid;
  }, [formData, validateField]);

  const handleSubmit = useCallback( async() => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const res = await onSubmit(formData as any);
      console.log("res::", res);
      setFormData({name: "",email: "", phone: "", password: "", role: formData.role});
      setErrors({});
      setTouched({});
      setSubmitSuccess(true);
    } catch (error:any) {
      if(error?.response?.data?.data){
        showError(error?.response?.data?.data.message || "Có lỗi xảy ra");
      }
      setSubmitSuccess(false);
    }finally{
      setIsSubmitting(false);
    }
    
  }, [formData, validateForm, onSubmit, onClose]);

  const handleReset = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: ROLE.STUDENT,
    });
    setErrors({});
    setTouched({});
  }, []);

  const modalWidth = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 'w-full'; // Mobile: full width
      if (width < 1024) return 'w-3/5'; // Tablet: 75%
      return 'w-1/2 max-w-3xl'; // Desktop: 50%, max 3xl
    }
    return 'w-1/2 max-w-3xl';
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed h-full inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full ${modalWidth} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 md:p-8 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản</h2>
                <p className="text-sm text-gray-600">Điền thông tin người dùng mới</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="text-gray-500" size={24} />
            </button>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">Tạo tài khoản thành công!</h3>
                <p className="text-sm text-green-600">Người dùng đã được thêm vào hệ thống.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6 h-3/5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions
                .filter(item=> item.value === roleUser)
                .map((option) => (
                  <RoleButton
                    key={option.value}
                    option={option}
                    isSelected={formData.role === option.value}
                    onClick={() => handleRoleChange(option.value)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Họ và tên"
                name="name"
                icon={UserCircle}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                touched={touched.name}
                required
                placeholder="Nguyễn Văn A"
              />

              {/* MK */}
              <FormInput
                label="Mật khẩu"
                name="password"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <FormInput
                label="Email"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                required
                placeholder="email@example.com"
              />

              {/* Phone */}
              <FormInput
                label="Số điện thoại"
                name="phone"
                type="tel"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                required
                placeholder="0912345***"
              />
            </div>

            {/* Teacher-specific fields
            {formData.role === ROLE.TEACHER && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                {/* <FormInput
                  label="Môn giảng dạy"
                  name="subject"
                  icon={BookOpen}
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.subject}
                  touched={touched.subject}
                  required
                  placeholder="Toán học, Vật lý..."
                /> */}

                {/* <FormInput
                  label="Kinh nghiệm (năm)"
                  name="experience"
                  type="number"
                  icon={Briefcase}
                  value={formData.experience ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.experience}
                  touched={touched.experience}
                  required
                  placeholder="5"
                  min="0"
                  max="50"
                /> */}
              {/* </div> */}
            {/* )} */}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3 sticky bottom-0 bg-white pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default CreateUserModal;