import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface DayStats {
    day: string;
    shortDay: string;
    date: string;
    attendance: number;
    students: number;
    sessions: number;
}

interface WeeklyStatsProps {
    className?: string;
}

export default function WeeklyStats({ className = '' }: WeeklyStatsProps) {
    const [selectedMetric, setSelectedMetric] = useState<'attendance' | 'students' | 'sessions'>('attendance');
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    // Generate weekly data based on offset
    const getWeekData = (offset: number): DayStats[] => {
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + (offset * 7));

        // Find Monday of that week
        const dayOfWeek = baseDate.getDay();
        const monday = new Date(baseDate);
        monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const days: DayStats[] = [];
        const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        const shortDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

        // Demo data with slight variations
        const baseAttendance = [95, 88, 92, 97, 85];
        const baseStudents = [142, 138, 145, 148, 130];
        const baseSessions = [12, 14, 10, 15, 11];

        for (let i = 0; i < 5; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            // Add some randomness for demo
            const variance = offset !== 0 ? Math.floor(Math.random() * 10) - 5 : 0;

            days.push({
                day: dayNames[i],
                shortDay: shortDays[i],
                date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                attendance: Math.max(70, Math.min(100, baseAttendance[i] + variance)),
                students: Math.max(100, baseStudents[i] + variance * 3),
                sessions: Math.max(5, baseSessions[i] + Math.floor(variance / 2)),
            });
        }

        return days;
    };

    const weekData = getWeekData(currentWeekOffset);
    const prevWeekData = getWeekData(currentWeekOffset - 1);

    // Calculate averages
    const getAverage = (data: DayStats[], metric: 'attendance' | 'students' | 'sessions') => {
        return data.reduce((sum, d) => sum + d[metric], 0) / data.length;
    };

    const currentAvg = getAverage(weekData, selectedMetric);
    const prevAvg = getAverage(prevWeekData, selectedMetric);
    const percentChange = ((currentAvg - prevAvg) / prevAvg) * 100;

    const getMaxValue = () => {
        switch (selectedMetric) {
            case 'attendance': return 100;
            case 'students': return 160;
            case 'sessions': return 20;
        }
    };

    const getMetricLabel = () => {
        switch (selectedMetric) {
            case 'attendance': return 'Présence';
            case 'students': return 'Étudiants';
            case 'sessions': return 'Sessions';
        }
    };

    const getMetricUnit = () => {
        return selectedMetric === 'attendance' ? '%' : '';
    };

    const getWeekLabel = () => {
        const start = weekData[0];
        const end = weekData[4];
        return `${start.date} - ${end.date}`;
    };

    const getBarColor = (value: number, metric: string) => {
        if (metric === 'attendance') {
            if (value >= 95) return 'from-green-400 to-green-500';
            if (value >= 85) return 'from-blue-400 to-blue-500';
            if (value >= 75) return 'from-yellow-400 to-yellow-500';
            return 'from-red-400 to-red-500';
        }
        return 'from-[#234C6A] to-[#456882]';
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Statistiques de la Semaine</h2>
                    <p className="text-sm text-gray-500">{getWeekLabel()}</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                        {currentWeekOffset === 0 ? 'Cette semaine' : currentWeekOffset === -1 ? 'Semaine dernière' : getWeekLabel()}
                    </span>
                    <button
                        onClick={() => setCurrentWeekOffset(prev => Math.min(0, prev + 1))}
                        disabled={currentWeekOffset >= 0}
                        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Metric Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'attendance', label: 'Présence', icon: Clock, color: 'text-green-600 bg-green-50' },
                    { key: 'students', label: 'Étudiants', icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { key: 'sessions', label: 'Sessions', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
                ].map((metric) => (
                    <button
                        key={metric.key}
                        onClick={() => setSelectedMetric(metric.key as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${selectedMetric === metric.key
                            ? 'bg-[#234C6A] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <metric.icon className="w-4 h-4" />
                        {metric.label}
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                        {currentAvg.toFixed(selectedMetric === 'attendance' ? 1 : 0)}{getMetricUnit()}
                    </p>
                    <p className="text-xs text-gray-500">Moyenne</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                        {Math.max(...weekData.map(d => d[selectedMetric]))}{getMetricUnit()}
                    </p>
                    <p className="text-xs text-gray-500">Maximum</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`flex items-center justify-center gap-1 ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {percentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <p className="text-2xl font-bold">
                            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">vs semaine précédente</p>
                </div>
            </div>

            {/* Chart */}
            <div className="space-y-3">
                {weekData.map((day, index) => {
                    const value = day[selectedMetric];
                    const maxVal = getMaxValue();
                    const percentage = (value / maxVal) * 100;

                    return (
                        <div key={day.day} className="group">
                            <div className="flex items-center gap-4">
                                <div className="w-16">
                                    <p className="text-sm font-medium text-gray-700">{day.shortDay}</p>
                                    <p className="text-xs text-gray-400">{day.date}</p>
                                </div>
                                <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getBarColor(value, selectedMetric)} rounded-lg transition-all duration-700 ease-out group-hover:opacity-90`}
                                        style={{
                                            width: `${percentage}%`,
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-end pr-3">
                                        <span className={`text-sm font-semibold ${percentage > 50 ? 'text-white' : 'text-gray-700'}`}>
                                            {value}{getMetricUnit()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Total: <strong className="text-gray-900">
                        {weekData.reduce((sum, d) => sum + d[selectedMetric], 0)}{selectedMetric === 'attendance' ? '' : ` ${getMetricLabel().toLowerCase()}`}
                    </strong>
                </p>
                <button className="text-sm text-[#234C6A] hover:underline font-medium">
                    Voir rapport détaillé →
                </button>
            </div>
        </div>
    );
}
