import { AlertCircle } from "lucide-react";
import { memo } from "react";

const FormInput = memo(({ 
  label, 
  name, 
  type = "text", 
  icon: Icon, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  placeholder,
  min,
  max 
}: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" size={20} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        min={min}
        max={max}
        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
          touched && error
            ? "border-red-300 bg-red-50"
            : touched && !error && value
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-gray-50"
        }`}
        placeholder={placeholder}
      />
    </div>
    {touched && error && (
      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    )}
  </div>
));

export default FormInput;