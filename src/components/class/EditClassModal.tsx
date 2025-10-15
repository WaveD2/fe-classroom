import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { STATUS_CLASS, ClassI } from "../../types";
import Textarea from "../common/Textarea";

type Props = {
  open: boolean;
  classItem?: ClassI | null;
  onClose: () => void;
  onSave: (data: Partial<ClassI>) => Promise<void>;
};

const EditClassModal = ({ open, classItem, onClose, onSave }: Props) => {
  const [form, setForm] = useState<Partial<ClassI>>({
    name: "",
    description: "",
    uniqueCode: "",
    academicCredit: 0,
    status: STATUS_CLASS.OPEN,
  });

  useEffect(() => {
    if (classItem) {
      setForm({
        name: classItem.name,
        description: classItem.description || "",
        uniqueCode: classItem.uniqueCode,
        academicCredit: classItem.academicCredit,
        status: classItem.status || STATUS_CLASS.OPEN,
      });
    }
  }, [classItem]);

  const handleChange = (key: keyof ClassI, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name?.trim()) return;
    await onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-11/12 sm:w-[480px] rounded-2xl shadow-2xl p-6 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          ✏️ Chỉnh sửa lớp học
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Cập nhật thông tin chi tiết của lớp học bên dưới.
        </p>

        {/* Form */}
        <div className="space-y-4">
          {/* Tên lớp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Phát triển ứng dụng web"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Mã lớp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã lớp
            </label>
            <input
              type="text"
              value={form.uniqueCode || ""}
              onChange={(e) => handleChange("uniqueCode", e.target.value)}
              placeholder="VD: WEB2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Mô tả */}
          <Textarea
            label="Mô tả lớp học"
            placeholder="Nhập mô tả ngắn về lớp..."
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          {/* Số tín chỉ & trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tín chỉ
              </label>
              <input
                type="number"
                min={0}
                value={form.academicCredit || 0}
                onChange={(e) =>
                  handleChange("academicCredit", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as STATUS_CLASS)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value={STATUS_CLASS.OPEN}>Mở</option>
                <option value={STATUS_CLASS.CLOSED}>Đóng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-3 border-t-indigo-300 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-indigo-300 cursor-pointer transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer transition"
          >
            💾 Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;
