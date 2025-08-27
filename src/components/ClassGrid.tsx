// ClassGrid.tsx
import { useState } from "react";
import { Calendar, Users, MoreVertical, X } from "lucide-react";
import Card from "./Card";
import { ClassI, STATUS_CLASS } from "../types";

type Props = {
  classes: ClassI[];
  onClassClick: (classItem: any) => void;
  onUpdateClass: (id: string, data: Partial<ClassI>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
};

const ClassGrid = ({ classes, onClassClick, onUpdateClass, onDeleteClass }: Props) => {
  const [selectedClass, setSelectedClass] = useState<ClassI | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<{
    name: string;
    uniqueCode: string;
    status: STATUS_CLASS;
  }>({
    name: "",
    uniqueCode: "",
    status: STATUS_CLASS.OPEN,
  });

  const openEditModal = (cls: ClassI) => {
    console.log("123(classItem)::", (cls));
    
    setSelectedClass(cls);
    setForm({
      name: cls.name,
      uniqueCode: cls.uniqueCode,
      status: cls.status || STATUS_CLASS.OPEN,
    });
    setIsEditModalOpen(true);
    setMenuOpen(null);
  };

  const openDeleteModal = (cls: ClassI) => {
    console.log("openDeleteModal(classItem)::", (cls));

    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = async () => {
      if (!selectedClass) return;
      onUpdateClass(selectedClass._id || selectedClass.id, form);
      setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
      if (!selectedClass) return;
      onDeleteClass(selectedClass._id || selectedClass.id);
      setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem) => (
          <Card
            key={classItem._id || classItem.id}
            onClick={() => onClassClick(classItem)}
            className="p-4 relative"
          >
            {/* Dropdown Menu */}
            <div className="absolute top-3 right-3 cursor-pointer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === classItem._id ? null : classItem._id);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen === classItem._id && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow border border-cyan-200 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditModal(classItem);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(classItem);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2 mr-5">
              <p className="flex items-center">
                <h3 className="font-semibold text-lg">{classItem.name}</h3>
              </p>
              
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ">
                {classItem.uniqueCode}
              </span>
            </div>
            {classItem.teacher && (
                  <p className="text-gray-600 text-sm mb-3">
                  Giáo viên: {classItem.teacher.name}
                </p>
              )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center">
                <Users size={16} className="mr-1" />
                {classItem.countStudent} thành viên
              </span>
              <span className="flex items-center mr-5">
                <Calendar size={16} className="mr-1" />
                {new Date(String(classItem.createdAt)).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white w-11/12 sm:w-[400px] rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa lớp</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Tên lớp</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mã lớp</label>
                <input
                  type="text"
                  value={form.uniqueCode}
                  onChange={(e) => setForm({ ...form, uniqueCode: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as STATUS_CLASS })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value={STATUS_CLASS.OPEN}>Mở</option>
                  <option value={STATUS_CLASS.CLOSED}>Đóng</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white w-11/12 sm:w-[400px] rounded-xl shadow-lg p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Xóa lớp</h2>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa lớp{" "}
              <span className="font-medium">{selectedClass?.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassGrid;
