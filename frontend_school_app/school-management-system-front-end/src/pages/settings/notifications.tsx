import { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar, Check, AlertCircle, Smartphone } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  icon: typeof Bell;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'attendance',
      title: 'Alertes de présence',
      description: 'Recevoir des notifications sur les absences des étudiants',
      email: true,
      push: true,
      icon: AlertCircle,
    },
    {
      id: 'events',
      title: 'Événements',
      description: 'Rappels pour les événements et réunions à venir',
      email: true,
      push: false,
      icon: Calendar,
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Notifications pour les nouveaux messages',
      email: false,
      push: true,
      icon: MessageSquare,
    },
    {
      id: 'grades',
      title: 'Notes et résultats',
      description: 'Alertes lors de la publication des notes',
      email: true,
      push: true,
      icon: Check,
    },
    {
      id: 'system',
      title: 'Mises à jour système',
      description: 'Informations sur les mises à jour de la plateforme',
      email: true,
      push: false,
      icon: Bell,
    },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleSetting = (id: string, type: 'email' | 'push') => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, [type]: !s[type] } : s
    ));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#1B3C53] mb-1">Notifications</h2>
        <p className="text-gray-600">Configurer vos préférences de notification</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="w-5 h-5" />
          Préférences de notification enregistrées!
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Canaux de notification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Email</h4>
              <p className="text-sm text-gray-500">admin@schola.com</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Actif</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Push Mobile</h4>
              <p className="text-sm text-gray-500">App SCHOLA</p>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Non configuré</span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Préférences par type</h3>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500 px-4">
          <div className="col-span-6">Type de notification</div>
          <div className="col-span-3 text-center">Email</div>
          <div className="col-span-3 text-center">Push</div>
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <setting.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
              </div>

              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.email ? 'bg-[#234C6A]' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => toggleSetting(setting.id, 'push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.push ? 'bg-[#234C6A]' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Enregistrer les préférences
        </button>
      </div>
    </div>
  );
}
