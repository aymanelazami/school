import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Users, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface AttendanceRecord {
    id: number;
    studentName: string;
    date: string;
    status: 'present' | 'absent' | 'retard';
    className: string;
    module?: string;
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Fetch attendance
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get('/api/absences');
                setRecords(response.data);
            } catch (err) {
                console.error('Error fetching attendance:', err);
                // Mock data
                setRecords([
                    { id: 1, studentName: 'Jean Dupont', date: '2024-01-15', status: 'present', className: 'L3 Info A', module: 'Programmation' },
                    { id: 2, studentName: 'Marie Martin', date: '2024-01-15', status: 'absent', className: 'L3 Info A', module: 'Programmation' },
                    { id: 3, studentName: 'Pierre Bernard', date: '2024-01-15', status: 'retard', className: 'L3 Info A', module: 'Programmation' },
                    { id: 4, studentName: 'Sophie Leroy', date: '2024-01-15', status: 'present', className: 'M1 Data', module: 'Machine Learning' },
                    { id: 5, studentName: 'Lucas Petit', date: '2024-01-15', status: 'present', className: 'M1 Data', module: 'Machine Learning' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Filter records
    const filteredRecords = records.filter(record => {
        const matchesSearch = record.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.className?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const lateCount = filteredRecords.filter(r => r.status === 'retard').length;
    const attendanceRate = filteredRecords.length > 0
        ? Math.round((presentCount / filteredRecords.length) * 100)
        : 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Présent' };
            case 'absent': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Absent' };
            case 'retard': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, label: 'Retard' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status };
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
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Gestion des Présences</h1>
                    <p className="text-gray-600 text-sm">Suivez les présences et absences des étudiants.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                    />
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un étudiant ou une classe…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'present', 'absent', 'retard'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === status
                                ? 'bg-[#234C6A] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Tous' : status === 'present' ? 'Présents' : status === 'absent' ? 'Absents' : 'Retards'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
                        <p className="text-xs text-gray-600">Total</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
                        <p className="text-xs text-gray-600">Présents</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
                        <p className="text-xs text-gray-600">Absents</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                        {attendanceRate}%
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
                        <p className="text-xs text-gray-600">Retards</p>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium">Étudiant</th>
                            <th className="px-6 py-4 text-left text-sm font-medium">Classe</th>
                            <th className="px-6 py-4 text-left text-sm font-medium">Module</th>
                            <th className="px-6 py-4 text-left text-sm font-medium">Date</th>
                            <th className="px-6 py-4 text-center text-sm font-medium">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.map(record => {
                            const badge = getStatusBadge(record.status);
                            const BadgeIcon = badge.icon;
                            return (
                                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white font-medium text-sm">
                                                {record.studentName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-medium text-gray-900">{record.studentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{record.className}</td>
                                    <td className="px-6 py-4 text-gray-600">{record.module || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(record.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${badge.bg} ${badge.text}`}>
                                                <BadgeIcon className="w-4 h-4" />
                                                {badge.label}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRecords.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun enregistrement trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
