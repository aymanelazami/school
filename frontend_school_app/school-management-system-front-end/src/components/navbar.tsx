import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onLogout?: () => void;
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export function Navbar({ onLogout, onMenuToggle, pageTitle }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Menu Button (mobile) + Search */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1">
          {/* Mobile Menu Button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}

          

          {/* Page Title (mobile only) */}
          {pageTitle && (
            <h1 className="lg:hidden text-[#1B3C53] flex-1 truncate">{pageTitle}</h1>
          )}

          {/* Search Bar (desktop) */}
          <div className="hidden lg:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f7e] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search Button (mobile) */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { title: 'Nouveau étudiant inscrit', time: 'Il y a 5 min' },
                    { title: 'Cours annulé - Math 101', time: 'Il y a 1h' },
                    { title: 'Rapport mensuel disponible', time: 'Il y a 2h' },
                  ].map((notif, idx) => (
                    <div key={idx} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                      <p className="text-sm text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button className="text-sm text-[#2d5f7e] hover:text-[#1d3e52] transition-all duration-200">
                    Voir tout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#1d3e52] to-[#2d5f7e] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">admin@schola.com</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Mon Profil</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}