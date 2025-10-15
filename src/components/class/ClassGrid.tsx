import { useState, useCallback, useEffect, useRef } from "react";
import { MoreHorizontal, Calendar, Users, GraduationCap, Edit2, Trash2 } from "lucide-react";
import Card from "../common/Card";
import EditClassModal from "./EditClassModal";
import ConfirmModal from "../common/ConfirmModal";
import { ClassI, STATUS_CLASS } from "../../types";


const ClassGrid = ({ classes, onClassClick, onUpdateClass, onDeleteClass }: any) => {
  const [selectedClass, setSelectedClass] = useState<ClassI | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const openModal = useCallback((type: "edit" | "delete", cls: ClassI) => {
    setSelectedClass(cls);
    setModalType(type);
    setOpenMenuId(null);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedClass(null);
  }, []);

  const handleSave = useCallback(
    async (data: Partial<ClassI>) => {
      if (selectedClass) {
        await onUpdateClass(selectedClass._id || selectedClass.id, data);
        closeModal();
      }
    },
    [selectedClass, onUpdateClass, closeModal]
  );

  const handleDelete = useCallback(async () => {
    if (selectedClass) {
      await onDeleteClass(selectedClass._id || selectedClass.id);
      closeModal();
    }
  }, [selectedClass, onDeleteClass, closeModal]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls: ClassI) => {
          const id = cls._id || cls.id;
          const credits = cls.academicCredit ?? 0;
          
          return (
            <Card
              key={id}
              className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-blue-200"
              onClick={() => onClassClick(cls)}
            >
              <div
                className="absolute top-4 right-4 z-20"
                //@ts-ignore
                ref={(el) => (menuRefs.current[id] = el)}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === id ? null : id);
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    openMenuId === id
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MoreHorizontal size={18} />
                </button>

                {/* Dropdown menu */}
                {openMenuId === id && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    style={{
                      animation: "fadeInScale 0.15s ease-out",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openModal("edit", cls);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm font-medium"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openModal("delete", cls);
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      <span>Xóa lớp</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="pr-8">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {cls.name}
                  </h3>
                  <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 mt-1 mr-3 rounded-full font-medium">
                    {cls.uniqueCode}
                  </span>
                  <span className={`text-xs bg-gradient-to-r from-${cls.status === STATUS_CLASS.OPEN ? 'green' : 'red'}-50 to-${cls.status === STATUS_CLASS.OPEN ? 'green' : 'red'}-50 text-${cls.status === STATUS_CLASS.OPEN ? 'green' : 'red'}-500 px-3 py-1 mt-1 rounded-full font-medium`}>
                    {cls.status === STATUS_CLASS.OPEN ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>

                {cls.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>
                )}

                {cls.teacher && (
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {cls.teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{cls.teacher.name}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-col items-center">
                    <Users size={18} className="text-blue-500 mb-1" />
                    <span className="text-xs text-gray-500">Học sinh</span>
                    <span className="text-sm font-semibold text-gray-800">{cls.studentCount ?? 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <GraduationCap size={18} className="text-green-500 mb-1" />
                    <span className="text-xs text-gray-500">Tín chỉ</span>
                    <span className="text-sm font-semibold text-gray-800">{credits}</span>
                  </div> 
                  <div className="flex flex-col items-center col-span-2">
                    <Calendar size={18} className="text-purple-500 mb-1" />
                    <span className="text-xs text-gray-500">Tạo lúc</span>
                    <span className="text-xs font-semibold text-gray-800 whitespace-normal">
                      {new Date(String(cls.createdAt)).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <EditClassModal
        open={modalType === "edit"}
        classItem={selectedClass}
        onClose={closeModal}
        onSave={handleSave}
      />

      <ConfirmModal
        open={modalType === "delete"}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp "${selectedClass?.name}" không? Hành động này không thể hoàn tác.`}
        onClose={closeModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ClassGrid;