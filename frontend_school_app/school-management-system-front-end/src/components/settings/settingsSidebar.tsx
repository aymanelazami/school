import { NavLink } from "react-router";
import { User, Lock, Bell } from "lucide-react";

const links = [
  { to: "/settings/profile", label: "Profil", icon: User }, // INDEX ROUTE
  { to: "/settings/security", label: "Sécurité", icon: Lock },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
];

export default function SettingsSidebar() {
  return (
    <aside className="w-64 bg-white rounded-xl p-4 shadow-sm">
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-[#234C6A] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
