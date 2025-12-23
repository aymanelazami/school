import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MapPin, Clock, Users, Edit, Trash2, X, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface Event {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    type: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/api/events');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
                // Use mock data for now
                setEvents([
                    { id: 1, title: 'Réunion Parents-Enseignants', description: 'Réunion trimestrielle', startDate: '2024-01-15T14:00', endDate: '2024-01-15T17:00', location: 'Salle A102', type: 'meeting' },
                    { id: 2, title: 'Examen Semestre 1', description: 'Examens finaux', startDate: '2024-01-20T08:00', endDate: '2024-01-25T17:00', location: 'Amphithéâtre', type: 'exam' },
                    { id: 3, title: 'Journée Portes Ouvertes', description: 'Visite du campus', startDate: '2024-02-01T09:00', endDate: '2024-02-01T16:00', location: 'Campus Principal', type: 'event' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Filtered events
    const filteredEvents = events.filter(event => {
        const searchLower = searchQuery.toLowerCase();
        return (
            event.title?.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower) ||
            event.location?.toLowerCase().includes(searchLower)
        );
    });

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'exam': return 'bg-red-100 text-red-700 border-red-200';
            case 'event': return 'bg-green-100 text-green-700 border-green-200';
            case 'holiday': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Événements</h1>
                    <p className="text-gray-600 text-sm">Gérez les événements et le calendrier scolaire.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm transition ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-md text-sm transition ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
                        >
                            Calendrier
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all"
                    >
                        <Plus className="w-5 h-5" /> Ajouter
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un événement…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                        <p className="text-xs text-gray-600">Total Événements</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.type === 'meeting').length}</p>
                        <p className="text-xs text-gray-600">Réunions</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.type === 'exam').length}</p>
                        <p className="text-xs text-gray-600">Examens</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.type === 'event').length}</p>
                        <p className="text-xs text-gray-600">Événements</p>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {filteredEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex flex-col items-center justify-center text-white">
                                    <span className="text-lg font-bold">{new Date(event.startDate).getDate()}</span>
                                    <span className="text-xs">{new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs border ${getEventTypeColor(event.type)}`}>
                                            {event.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{event.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(event.startDate)}
                                        </span>
                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
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
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        Aucun événement trouvé
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
                        <h2 className="text-xl font-semibold mb-4">Ajouter un Événement</h2>
                        <form className="space-y-4">
                            <input placeholder="Titre" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <textarea placeholder="Description" rows={2} className="w-full border border-gray-300 p-3 rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="datetime-local" className="w-full border border-gray-300 p-3 rounded-lg" />
                                <input type="datetime-local" className="w-full border border-gray-300 p-3 rounded-lg" />
                            </div>
                            <input placeholder="Lieu" className="w-full border border-gray-300 p-3 rounded-lg" />
                            <select className="w-full border border-gray-300 p-3 rounded-lg">
                                <option value="">Type d'événement</option>
                                <option value="meeting">Réunion</option>
                                <option value="exam">Examen</option>
                                <option value="event">Événement</option>
                                <option value="holiday">Vacances</option>
                            </select>
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
