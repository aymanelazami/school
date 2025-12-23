import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, DoorOpen, Users, Monitor, X, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface Room {
    id: number;
    name: string;
    capacity: number;
    type: string;
    building?: string;
    floor?: number;
    equipment?: string[];
    isAvailable: boolean;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');

    // Fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/api/rooms');
                setRooms(response.data);
            } catch (err) {
                console.error('Error fetching rooms:', err);
                // Mock data
                setRooms([
                    { id: 1, name: 'A101', capacity: 50, type: 'classroom', building: 'Bâtiment A', floor: 1, equipment: ['Projecteur', 'Tableau blanc'], isAvailable: true },
                    { id: 2, name: 'B201', capacity: 30, type: 'lab', building: 'Bâtiment B', floor: 2, equipment: ['Ordinateurs', 'Projecteur'], isAvailable: false },
                    { id: 3, name: 'Amphi 1', capacity: 200, type: 'amphitheater', building: 'Bâtiment Principal', floor: 0, equipment: ['Micro', 'Projecteur', 'Enceintes'], isAvailable: true },
                    { id: 4, name: 'C102', capacity: 40, type: 'classroom', building: 'Bâtiment C', floor: 1, equipment: ['Projecteur'], isAvailable: true },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, []);

    // Filter rooms
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.building?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || room.type === filterType;
        return matchesSearch && matchesType;
    });

    // Stats
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const availableRooms = rooms.filter(r => r.isAvailable).length;

    const getRoomTypeInfo = (type: string) => {
        switch (type) {
            case 'classroom': return { icon: DoorOpen, color: 'from-blue-500 to-blue-700', label: 'Salle de cours' };
            case 'lab': return { icon: Monitor, color: 'from-purple-500 to-purple-700', label: 'Laboratoire' };
            case 'amphitheater': return { icon: Users, color: 'from-green-500 to-green-700', label: 'Amphithéâtre' };
            default: return { icon: DoorOpen, color: 'from-gray-500 to-gray-700', label: type };
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
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Gestion des Salles</h1>
                    <p className="text-gray-600 text-sm">Gérez les salles de cours et leur disponibilité.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all"
                >
                    <Plus className="w-5 h-5" /> Ajouter une Salle
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une salle…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'classroom', 'lab', 'amphitheater'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === type
                                    ? 'bg-[#234C6A] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {type === 'all' ? 'Toutes' : type === 'classroom' ? 'Salles' : type === 'lab' ? 'Labos' : 'Amphis'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <DoorOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                        <p className="text-xs text-gray-600">Total Salles</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <DoorOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{availableRooms}</p>
                        <p className="text-xs text-gray-600">Disponibles</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
                        <DoorOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{rooms.length - availableRooms}</p>
                        <p className="text-xs text-gray-600">Occupées</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                        <p className="text-xs text-gray-600">Capacité Totale</p>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map(room => {
                    const typeInfo = getRoomTypeInfo(room.type);
                    const TypeIcon = typeInfo.icon;
                    return (
                        <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-white`}>
                                    <TypeIcon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {room.isAvailable ? 'Disponible' : 'Occupée'}
                                    </span>
                                    <button className="p-1 text-gray-600 hover:text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                                    <button className="p-1 text-red-600 hover:text-red-700 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{typeInfo.label}</p>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>Capacité: {room.capacity} places</span>
                                </div>
                                {room.building && (
                                    <div className="flex items-center gap-2">
                                        <DoorOpen className="w-4 h-4 text-gray-400" />
                                        <span>{room.building} - Étage {room.floor}</span>
                                    </div>
                                )}
                            </div>
                            {room.equipment && room.equipment.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-1">
                                        {room.equipment.map((eq, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{eq}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredRooms.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500">
                        Aucune salle trouvée
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
                        <h2 className="text-xl font-semibold mb-4">Ajouter une Salle</h2>
                        <form className="space-y-4">
                            <input placeholder="Nom de la salle" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Capacité" className="w-full border border-gray-300 p-3 rounded-lg" />
                                <select className="w-full border border-gray-300 p-3 rounded-lg">
                                    <option value="">Type</option>
                                    <option value="classroom">Salle de cours</option>
                                    <option value="lab">Laboratoire</option>
                                    <option value="amphitheater">Amphithéâtre</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Bâtiment" className="w-full border border-gray-300 p-3 rounded-lg" />
                                <input type="number" placeholder="Étage" className="w-full border border-gray-300 p-3 rounded-lg" />
                            </div>
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
