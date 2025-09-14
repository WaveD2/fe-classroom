import { Outlet } from "react-router-dom";
import { Home, Menu, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import {  User } from "../types";
import { logout, updateProfile } from "../api/auth";
import ProfileModal from "./ProfileModal";

export default function Layout({ user }: { user: User }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleUpdateProfile = async (userData: Partial<User>) => {
    const response = await updateProfile(userData);
    if (response?.data) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response;
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          onShowProfile={() => setShowProfileModal(true)}
        />
        <main className="flex-1 overflow-y-auto  p-2 overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const menu = [
    { to: "/", label: "Lớp học", icon: <Home className="w-5 h-5" /> },
  ].filter(Boolean);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform md:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col p-4">
          <h1 className="text-xl font-bold text-indigo-600 mb-6">PTIT</h1>
          <nav className="flex flex-col gap-2">
            {menu.map((item: any) => (
              <a
                key={item.to}
                href={item.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-100 text-gray-700 transition-colors"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </a>
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
    <header className="h-14 flex items-center justify-between px-4 border-b bg-white shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          // @ts-expect-error - setSidebarOpen expects boolean but we're toggling
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Quản lý của {user.role === "teacher" ? "giáo viên" : user.role === "admin" ? 'hệ thống' : 'học sinh'}
        </h2>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpenMenu((prev) => !prev)}
        >
          <img src={`https://ui-avatars.com/api/?name=${user?.name?.replace(" ", "+")}&background=random`} alt="avatar" className="w-9 h-9 rounded-full border" />
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
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
