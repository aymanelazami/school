import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#E3E3E3] overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[270px] h-full bg-white shadow-lg">
        <Sidebar />
      </aside>



      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="h-[70px] shrink-0">
          <Navbar onLogout={handleLogout} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

      </div>
    </div>
  );


}
