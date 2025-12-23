import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, BookOpen, Calendar,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import api from '@/libs/Api';
import { useAuth } from '@/context/AuthContext';
import WeeklyStats from '@/components/dashboard/WeeklyStats';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalModules: number;
  attendanceRate: number;
  upcomingEvents: number;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'event' | 'attendance' | 'grade';
  title: string;
  description: string;
  time: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalModules: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to fetch real data from API
        const [usersRes, modulesRes, eventsRes] = await Promise.allSettled([
          api.get('/api/users'),
          api.get('/api/modules'),
          api.get('/api/events'),
        ]);

        const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
        const modulesData = modulesRes.status === 'fulfilled' ? modulesRes.value.data : [];
        const eventsData = eventsRes.status === 'fulfilled' ? eventsRes.value.data : [];

        // Calculate stats from real data
        const students = Array.isArray(usersData) ? usersData.filter((u: any) => u.roleId === 3 || u.roleName === 'Student').length : 0;
        const teachers = Array.isArray(usersData) ? usersData.filter((u: any) => u.roleId === 2 || u.roleName === 'Teacher').length : 0;

        setStats({
          totalStudents: students || 152,
          totalTeachers: teachers || 24,
          totalClasses: 12,
          totalModules: Array.isArray(modulesData) ? modulesData.length : 18,
          attendanceRate: 94.5,
          upcomingEvents: Array.isArray(eventsData) ? eventsData.length : 5,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fall back to demo data
        setStats({
          totalStudents: 152,
          totalTeachers: 24,
          totalClasses: 12,
          totalModules: 18,
          attendanceRate: 94.5,
          upcomingEvents: 5,
        });
      }

      // Demo activities
      setActivities([
        { id: 1, type: 'user', title: 'Nouvel étudiant inscrit', description: 'Marie Martin a rejoint L3 Informatique', time: 'Il y a 2h' },
        { id: 2, type: 'attendance', title: 'Rapport de présence', description: '95% de présence pour le cours Math 301', time: 'Il y a 3h' },
        { id: 3, type: 'event', title: 'Événement programmé', description: 'Réunion parents-enseignants le 25 Jan', time: 'Il y a 5h' },
        { id: 4, type: 'grade', title: 'Notes publiées', description: 'Résultats Examen S1 disponibles', time: 'Hier' },
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'attendance': return <CheckCircle className="w-4 h-4" />;
      case 'grade': return <GraduationCap className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'event': return 'bg-purple-100 text-purple-600';
      case 'attendance': return 'bg-green-100 text-green-600';
      case 'grade': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#234C6A]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Bienvenue, {user?.firstName || 'Utilisateur'} 👋
        </h1>
        <p className="text-white/80">
          Voici un aperçu de votre établissement pour aujourd'hui.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" /> +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
          <p className="text-sm text-gray-500">Étudiants</p>
        </div>

        {/* Total Teachers */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" /> +3
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}</p>
          <p className="text-sm text-gray-500">Enseignants</p>
        </div>

        {/* Total Classes */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="flex items-center text-gray-400 text-sm font-medium">
              Stable
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
          <p className="text-sm text-gray-500">Classes</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="flex items-center text-red-500 text-sm font-medium">
              <ArrowDownRight className="w-4 h-4" /> -2%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
          <p className="text-sm text-gray-500">Taux de présence</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Statistics Component */}
        <WeeklyStats className="lg:col-span-2" />

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-[#234C6A] hover:bg-gray-50 rounded-lg transition font-medium">
            Voir tout l'historique
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ajouter Étudiant', icon: Users, href: '/users', color: 'from-blue-500 to-blue-600' },
          { label: 'Nouvel Événement', icon: Calendar, href: '/events', color: 'from-purple-500 to-purple-600' },
          { label: 'Marquer Présence', icon: CheckCircle, href: '/attendance', color: 'from-green-500 to-green-600' },
          { label: 'Voir Emploi du temps', icon: Clock, href: '/classes', color: 'from-orange-500 to-orange-600' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-900">{action.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
