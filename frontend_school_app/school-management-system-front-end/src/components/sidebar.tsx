import { NavLink } from "react-router";
import {
  Home, BookOpen, ClipboardCheck, Settings,
  UsersRound, ShieldCheck, Calendar, DoorOpen, Library
} from "lucide-react";
import logoImage from "/logo.jpeg";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/users", label: "User Management", icon: UsersRound },
  { to: "/roles", label: "Roles & Permissions", icon: ShieldCheck },
  { to: "/events", label: "Événements", icon: Calendar },
  { to: "/classes", label: "Classes & Cours", icon: BookOpen },
  { to: "/models", label: "Modules", icon: Library },
  { to: "/attendance", label: "Présences", icon: ClipboardCheck },
  { to: "/rooms", label: "Salles", icon: DoorOpen },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  return (
    <aside
      className={`h-full bg-[#1d3e52] text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex justify-center">
        <div className={`${isCollapsed ? "w-12 h-12" : "w-24 h-24"} rounded-full bg-white shadow-lg overflow-hidden`}>
          <img src={logoImage} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              } px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                isActive
                  ? "bg-[#2d5f7e] border-l-4 border-[#5d8199]"
                  : "hover:bg-[#234C6A]"
              }`
            }
            title={isCollapsed ? label : ""}
          >
            <Icon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">{label}</span>}

            {/* Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 text-xs text-white/60 text-center">
          © 2025 SCHOLA System
        </div>
      )}
    </aside>
  );
}
