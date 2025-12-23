import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, Key, Users, ChevronDown, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRole, setExpandedRole] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/api/roles');
                setRoles(response.data);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Failed to load roles');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoles();
    }, []);

    // Filtered roles
    const filteredRoles = roles.filter(role => {
        const searchLower = searchQuery.toLowerCase();
        return (
            role.name?.toLowerCase().includes(searchLower) ||
            role.description?.toLowerCase().includes(searchLower)
        );
    });

    // Handle delete
    const handleDelete = async (roleId: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return;
        try {
            await api.delete(`/api/roles/${roleId}`);
            setRoles(roles.filter(r => r.id !== roleId));
        } catch (err) {
            console.error('Error deleting role:', err);
            setError('Failed to delete role');
        }
    };

    const getRoleColor = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'admin': return 'from-purple-500 to-purple-700';
            case 'teacher': return 'from-blue-500 to-blue-700';
            case 'student': return 'from-green-500 to-green-700';
            default: return 'from-gray-500 to-gray-700';
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
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Rôles & Permissions</h1>
                    <p className="text-gray-600 text-sm">Gérez les rôles et leurs permissions d'accès.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all"
                >
                    <Plus className="w-5 h-5" /> Ajouter un Rôle
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un rôle…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                        <p className="text-xs text-gray-600">Total Rôles</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                        <p className="text-xs text-gray-600">Permissions</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">150</p>
                        <p className="text-xs text-gray-600">Utilisateurs Assignés</p>
                    </div>
                </div>
            </div>

            {/* Roles List */}
            <div className="space-y-4">
                {filteredRoles.map(role => (
                    <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Role Header */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRoleColor(role.name)} flex items-center justify-center text-white`}>
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description || 'Aucune description'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(role.id); }}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {expandedRole === role.id ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* Permissions */}
                        {expandedRole === role.id && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Permissions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['read', 'create', 'update', 'delete'].map(perm => (
                                        <span key={perm} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredRoles.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        Aucun rôle trouvé
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Ajouter un Rôle</h2>
                        <form className="space-y-4">
                            <input
                                placeholder="Nom du rôle"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                rows={3}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#234C6A] text-white rounded-lg hover:bg-[#1B3C53] transition"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
