import { Outlet } from "react-router";
import SettingsSidebar from "./settingsSidebar.tsx";

export default function SettingsLayout() {
  return (
    <div className="p-6 space-y-6 ">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <span>Accueil</span>
        <span>/</span>
        <span className="text-[#234C6A]">Paramètres</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#1B3C53] text-2xl mb-1">Paramètres</h1>
        <p className="text-gray-600">
          Gérez les paramètres de votre compte et de l'application
        </p>
      </div>

      

      <div className="flex gap-6">
        <SettingsSidebar />

        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
