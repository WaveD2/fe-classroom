import { Outlet, NavLink } from "react-router-dom";
import { Home, Menu, LogOut, User as UserIcon, Award } from "lucide-react";
import { useState } from "react";
import {  ROLE, User } from "../../types";
import { logout, updateProfile } from "../../api/auth";
import ProfileModal from "../user/ProfileModal";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) as User : null;
  });
  
  const handleUpdateProfile = async (userData: Partial<User>) => {
    const response = await updateProfile(userData);
    if (response?.data) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(response.data.data)
    }
    return response;
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          onShowProfile={() => setShowProfileModal(true)}
        />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <main className="min-h-full">
            <Outlet />
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-4 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between">
                {/* Brand Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-indigo-600">PTIT</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Hệ thống quản lý lớp học và điểm số thông minh, giúp giáo viên và học sinh quản lý hiệu quả.
                  </p>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Thông tin liên hệ</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> support@PTIT.edu.vn
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Điện thoại:</span> (024) 1234-5678
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Địa chỉ:</span> Hà Nội, Việt Nam
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <p className="text-xs text-gray-500">
                    © 2025 PTIT. Tất cả quyền được bảo lưu.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      Chính sách bảo mật
                    </a>
                    <a href="#" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      Điều khoản sử dụng
                    </a>
                    <a href="#" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      Hỗ trợ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}

function Sidebar({user,  sidebarOpen, setSidebarOpen }: { user: User; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const menu = [
    { to: "/", label: "Quản lý lớp", icon: <Home className="w-5 h-5" /> },
  ]
  if(user.role === ROLE.ADMIN) {
    menu.push(
      { to: "/student", label: "Quản lý sinh viên", icon: <UserIcon className="w-5 h-5" /> },
      { to: "/teacher", label: "Quản lý giáo viên", icon: <UserIcon className="w-5 h-5" /> },
      { to: "/class", label: "Thành viên lớp học", icon: <Home className="w-5 h-5" /> },
    )
  }
  
  if(user.role !== ROLE.STUDENT) {
    menu.push(
      { to: "/grades", label: "Quản lý điểm sinh viên", icon: <Award className="w-5 h-5" /> },
      // { to: "/document", label: "Quản lý tài liệu", icon: <DownloadCloudIcon className="w-5 h-5" /> },
    )
  }
  
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform md:translate-x-0 transition-transform duration-300 ease-in-out md:overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://career.gpo.vn/uploads/images/truong-hoc/logo-hoc-vien-cong-nghe-buu-chinh-vien-thong-1-.jpg" 
              alt="PTIT Logo" 
              className="h-12 w-auto object-contain max-w-full"
            />
          </div>
          <nav className="flex flex-col gap-2 mt-3">
            {menu.map((item: any) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`
                }
                end
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Header({ 
  user, 
  setSidebarOpen, 
  onShowProfile 
}: { 
  user: User; 
  setSidebarOpen: (open: boolean) => void;
  onShowProfile: () => void;
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth";
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white shadow-sm z-20 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          // @ts-ignore
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpenMenu((prev) => !prev)}
        >
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name?.replace(" ", "+")}&background=random`} alt="avatar" className="w-9 h-9 rounded-full border" />
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-300 cursor-pointer p-2 z-50">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
              onClick={() => {
                onShowProfile();
                setOpenMenu(false);
              }}
            >
              <UserIcon className="w-4 h-4" /> Thông tin cá nhân
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-red-600"
              onClick={handleLogout}
            > 
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
