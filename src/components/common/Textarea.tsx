import React, { useRef, useEffect } from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<Props> = ({ label, error, value, onChange, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động điều chỉnh chiều cao khi nhập
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        {...props}
        className={`resize-none w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          error ? "border-red-500" : "border-gray-300"
        } ${props.className || ""}`}
        rows={1}
        style={{ overflow: "hidden" }}
      />

      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default Textarea;
