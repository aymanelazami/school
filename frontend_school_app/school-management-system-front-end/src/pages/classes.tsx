import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, Users, Clock, GraduationCap, X, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface Class {
    id: number;
    name: string;
    level: string;
    teacher?: string;
    students: number;
    schedule?: string;
    room?: string;
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/api/groups');
                setClasses(response.data);
            } catch (err) {
                console.error('Error fetching classes:', err);
                // Mock data
                setClasses([
                    { id: 1, name: 'L3 Informatique A', level: 'Licence 3', teacher: 'Dr. Martin', students: 35, schedule: 'Lundi-Vendredi 8h-16h', room: 'B201' },
                    { id: 2, name: 'M1 Data Science', level: 'Master 1', teacher: 'Pr. Dupont', students: 28, schedule: 'Mardi-Samedi 9h-17h', room: 'A102' },
                    { id: 3, name: 'L2 Mathématiques', level: 'Licence 2', teacher: 'Dr. Bernard', students: 42, schedule: 'Lundi-Vendredi 8h-16h', room: 'C305' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // Filtered classes
    const filteredClasses = classes.filter(c => {
        const searchLower = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(searchLower) ||
            c.level?.toLowerCase().includes(searchLower) ||
            c.teacher?.toLowerCase().includes(searchLower)
        );
    });

    const totalStudents = filteredClasses.reduce((sum, c) => sum + c.students, 0);

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
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Classes & Cours</h1>
                    <p className="text-gray-600 text-sm">Gérez les classes et les groupes d'étudiants.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all"
                >
                    <Plus className="w-5 h-5" /> Ajouter une Classe
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher une classe…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                        <p className="text-xs text-gray-600">Total Classes</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                        <p className="text-xs text-gray-600">Total Étudiants</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(totalStudents / Math.max(classes.length, 1))}</p>
                        <p className="text-xs text-gray-600">Moy. par Classe</p>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map(cls => (
                    <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{cls.name}</h3>
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs mb-3">{cls.level}</span>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>{cls.teacher || 'Non assigné'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{cls.students} étudiants</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{cls.schedule || 'Horaire non défini'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredClasses.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500">
                        Aucune classe trouvée
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Ajouter une Classe</h2>
                        <form className="space-y-4">
                            <input placeholder="Nom de la classe" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <select className="w-full border border-gray-300 p-3 rounded-lg">
                                <option value="">Niveau</option>
                                <option value="L1">Licence 1</option>
                                <option value="L2">Licence 2</option>
                                <option value="L3">Licence 3</option>
                                <option value="M1">Master 1</option>
                                <option value="M2">Master 2</option>
                            </select>
                            <input placeholder="Enseignant responsable" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <input placeholder="Salle" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-[#234C6A] text-white rounded-lg">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
