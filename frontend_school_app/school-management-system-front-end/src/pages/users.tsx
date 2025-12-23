import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Mail, X, Loader2 } from 'lucide-react';
import api from '@/libs/Api';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roleId: number | null;
    roleName?: string;
    isActive: boolean;
    groupeId?: number;
    createdAt?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: '',
    });

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/users');
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filtered users
    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.roleName?.toLowerCase().includes(searchLower)
        );
    });

    // Stats
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Handle delete
    const handleDelete = async (userId: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            await api.delete(`/api/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };

    // Handle edit click
    const handleEditClick = (user: User) => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',
            roleId: user.roleId?.toString() || '',
        });
        setShowEditModal(true);
    };

    const getRoleBadgeStyle = (roleName?: string) => {
        switch (roleName?.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'teacher': return 'bg-blue-100 text-blue-700';
            case 'student': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
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
                    <h1 className="text-2xl font-bold text-[#1B3C53] mb-1">Gestion des Utilisateurs</h1>
                    <p className="text-gray-600 text-sm">Gérez les comptes utilisateurs et leurs rôles.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all"
                >
                    <Plus className="w-5 h-5" /> Ajouter un Utilisateur
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
                    placeholder="Rechercher par nom, email, rôle…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                        <p className="text-xs text-gray-600">Total Utilisateurs</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                        <p className="text-xs text-gray-600">Actifs</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
                        <UserX className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{inactiveUsers}</p>
                        <p className="text-xs text-gray-600">Inactifs</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium">Utilisateur</th>
                            <th className="px-6 py-4 text-left text-sm font-medium">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-medium">Rôle</th>
                            <th className="px-6 py-4 text-center text-sm font-medium">Statut</th>
                            <th className="px-6 py-4 text-center text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white font-medium">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${getRoleBadgeStyle(user.roleName)}`}>
                                        {user.roleName || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {user.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal would go here - simplified for now */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">
                            {showEditModal ? 'Modifier Utilisateur' : 'Ajouter un Utilisateur'}
                        </h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Prénom"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                                <input
                                    placeholder="Nom"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            {!showEditModal && (
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            )}
                            <select
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
                                value={formData.roleId}
                                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                            >
                                <option value="">Sélectionner un rôle</option>
                                <option value="1">Admin</option>
                                <option value="2">Teacher</option>
                                <option value="3">Student</option>
                            </select>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#234C6A] text-white rounded-lg hover:bg-[#1B3C53] transition"
                                >
                                    {showEditModal ? 'Enregistrer' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
