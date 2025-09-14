import { useEffect, useState, useCallback } from "react";
import ClassDetailView from "../components/ClassDetailView";
import Button from "../components/Button";
import { QrCode, PlusCircle } from "lucide-react";
import SearchBar from "../components/Search";
import ClassGrid from "../components/ClassGrid";
import QRScanner from "../components/QrScan";
import Pagination from "../components/Pagination";
import { ClassI, ROLE, ClassFilter, PaginationInfo } from "../types";
import { createClass, deleteClass, getClass, getClassByAdmin, updateClass } from "../api/class";
import { showError, showSuccess } from "../components/Toast";


const Dashboard = ({ userRole }: { userRole: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false); 
  const [selectedClass, setSelectedClass] = useState<ClassI | null>(null);
  const [classes, setClasses] = useState<ClassI[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateClass = async (newClass: { name: string; code: string }) => {
    try {
      const response = await createClass(newClass); 
      if (response?.data) {
        // Refresh the current page after creating a new class
        await fetchClassesData();
        setShowCreateClass(false);
        showSuccess("Tạo lớp học thành công");
      } 

    } catch (error: any) {
      showError(String(error) || "Có lỗi xảy ra");
    }
  };
  
  const fetchClassesData = useCallback(async (page = pagination.page, search = searchTerm) => {
    setIsLoading(true);
    try {
      const filter: ClassFilter = {
        page,
        limit: pagination.limit,
        search: search || undefined
      };

      let response;
      if (userRole === ROLE.ADMIN) {
        response = await getClassByAdmin(filter);
      } else {
        response = await getClass(filter);
      }

      if (response.data) {
        const {classes,pagination } =response.data
        setClasses(classes);
        setPagination(pagination);
      }
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      showError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  const fetchClasses = useCallback(async () => {
    await fetchClassesData();
  }, [fetchClassesData]);

  const fetchClassesByAdmin = useCallback(async () => {
    await fetchClassesData();
  }, [fetchClassesData]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchClassesData(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchClassesData]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchClassesData(page, searchTerm);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    switch (userRole) {
      case ROLE.TEACHER:
        fetchClasses();
        break;
      case ROLE.ADMIN:
        fetchClassesByAdmin();
    }
  }, [userRole, fetchClasses, fetchClassesByAdmin]);

  const handleUpdateClass = async (id: string, updatedClass: Partial<ClassI>) => {
    try {
      const response = await updateClass(id, updatedClass);

      if (response?.data) {
        await fetchClassesData();
        showSuccess("Cập nhật lớp học thành công");
      }
    } catch (error) {
      console.error('Error updating class:', error);
      showError("Có lỗi xảy ra khi cập nhật lớp học");
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClass(id);
      await fetchClassesData();
      showSuccess("Xóa lớp học thành công");
    } catch (error) {
      console.error('Error deleting class:', error);
      showError("Có lỗi xảy ra khi xóa lớp học");
    }
  };

  if (selectedClass) {
    return (
      <ClassDetailView
        classData={selectedClass}
        userRole={userRole}
        onBack={() => setSelectedClass(null)}
      />
    );
  }
  console.log(
    "pagination:::", pagination
  );
  
  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {userRole === ROLE.TEACHER || ROLE.ADMIN ? 'Quản lý lớp học' : 'Lớp học của tôi'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {userRole === ROLE.TEACHER ||  ROLE.ADMIN
              ? 'Quản lý và theo dõi các lớp học'
              : 'Tham gia và theo dõi lớp học'}
          </p>
        </div>

        {/* Nút theo role */}
        {userRole === ROLE.STUDENT && (
          <Button
            size="sm"
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét QR</span>
          </Button>
        )}

        {userRole === ROLE.TEACHER && (
          <Button
            size="sm"
            onClick={() => setShowCreateClass(true)}
            className="flex items-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo lớp</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Class Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar animate-fadeIn">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ClassGrid
            classes={classes}
            onClassClick={setSelectedClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={Number(pagination.page)}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        setClasses={setClasses}
      />

      {/* Modal tạo lớp */}
      {showCreateClass && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Tạo lớp học mới</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const code = (form.elements.namedItem("code") as HTMLInputElement).value;
                handleCreateClass({ name, code });
              }}
              className="space-y-4"
            >
              <input
                type="text"
                name="name"
                placeholder="Tên lớp học"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="code"
                placeholder="Mã lớp"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button  onClick={() => setShowCreateClass(false)} className="bg-gray-200 text-gray-700">
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 text-white">
                  Tạo lớp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
