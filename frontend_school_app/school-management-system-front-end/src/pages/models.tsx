import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, GraduationCap, Clock, CheckCircle, X } from 'lucide-react';

interface Module {
  id: number;
  code: string;
  name: string;
  credits: number;
  hours: number;
  semester: string;
  isActive: boolean;
  description: string;
}

export default function Models() {
  const [moduleData, setModulesData] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '',
    hours: '',
    semester: '',
    isActive: true,
    description: '',
  });

  // Fetch modules from backend
  useEffect(() => {
    fetch("http://localhost:3400/api/modules", { credentials: "include" })
      .then(res => res.json())
      .then(data => setModulesData(data))
      .catch(err => console.error(err))
  }, []);

  // Filtered modules based on search query
  const filteredModules = moduleData.filter(module => {
    const searchLower = searchQuery.toLowerCase();
    return (
      module.code.toLowerCase().includes(searchLower) ||
      module.name.toLowerCase().includes(searchLower) ||
      module.semester.toLowerCase().includes(searchLower) ||
      module.description.toLowerCase().includes(searchLower)
    );
  });

  // Statistics
  const totalCredits = filteredModules.reduce((sum, m) => sum + m.credits, 0);
  const totalHours = filteredModules.reduce((sum, m) => sum + m.hours, 0);
  const activeModules = filteredModules.filter(m => m.isActive).length;

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    const newModule: Module = {
      id: Math.max(...moduleData.map(m => m.id), 0) + 1,
      code: formData.code,
      name: formData.name,
      credits: parseInt(formData.credits),
      hours: parseInt(formData.hours),
      semester: formData.semester,
      isActive: formData.isActive,
      description: formData.description,
    };
    setModulesData([...moduleData, newModule]);
    setShowAddModal(false);
    setFormData({ code: '', name: '', credits: '', hours: '', semester: '', isActive: true, description: '' });
  };

  // Edit Module
  const handleEditClick = (module: Module) => {
    setEditingModule(module);
    setFormData({
      code: module.code,
      name: module.name,
      credits: module.credits.toString(),
      hours: module.hours.toString(),
      semester: module.semester,
      isActive: module.isActive,
      description: module.description,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      setModulesData(moduleData.map(module =>
        module.id === editingModule.id
          ? { ...module, ...formData, credits: parseInt(formData.credits), hours: parseInt(formData.hours) }
          : module
      ));
      setShowEditModal(false);
      setEditingModule(null);
      setFormData({ code: '', name: '', credits: '', hours: '', semester: '', isActive: true, description: '' });
    }
  };

  // Delete Module
  const handleDeleteModule = (moduleId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      setModulesData(moduleData.filter(module => module.id !== moduleId));
    }
  };

  // Toggle Active Status
  const toggleActiveStatus = (moduleId: number) => {
    setModulesData(moduleData.map(module =>
      module.id === moduleId
        ? { ...module, isActive: !module.isActive }
        : module
    ));
  };

  const getSemesterBadgeStyle = (semester: string) => {
    const semesterNum = semester.match(/\d+/)?.[0];
    switch (semesterNum) {
      case '1': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case '2': return 'bg-green-50 text-green-700 border border-green-200';
      case '3': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case '4': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case '5': return 'bg-pink-50 text-pink-700 border border-pink-200';
      case '6': return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#1B3C53] mb-1">Gestion des Modules</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gérez les modules d'enseignement et leurs crédits.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all">
          <Plus className="w-5 h-5" /> Ajouter un Module
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par code, nom, semestre…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{filteredModules.length}</p>
            <p className="text-xs text-gray-600">Total Modules</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{activeModules}</p>
            <p className="text-xs text-gray-600">Modules Actifs</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{totalCredits}</p>
            <p className="text-xs text-gray-600">Total Crédits</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{totalHours}</p>
            <p className="text-xs text-gray-600">Total Heures</p>
          </div>
        </div>
      </div>

      {/* Modules Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Code</th>
              <th className="px-6 py-4 text-left text-sm">Nom</th>
              <th className="px-6 py-4 text-left text-sm">Semestre</th>
              <th className="px-6 py-4 text-center text-sm">Crédits</th>
              <th className="px-6 py-4 text-center text-sm">Heures</th>
              <th className="px-6 py-4 text-center text-sm">Statut</th>
              <th className="px-6 py-4 text-center text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.map(module => (
              <tr key={module.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">{module.code}</td>
                <td className="px-6 py-4">{module.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs ${getSemesterBadgeStyle(module.semester)}`}>
                    {module.semester}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{module.credits}</td>
                <td className="px-6 py-4 text-center">{module.hours}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleActiveStatus(module.id)} className={`px-3 py-1 rounded-lg text-xs ${module.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                    {module.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEditClick(module)} className="text-gray-600 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteModule(module.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filteredModules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Aucun module trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Ajouter un Module</h2>
            <form className="space-y-3" onSubmit={handleAddModule}>
              <input placeholder="Code" className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              <input placeholder="Nom" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Crédits" type="number" className="w-full border p-2 rounded" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} required />
              <input placeholder="Heures" type="number" className="w-full border p-2 rounded" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} required />
              <input placeholder="Semestre" className="w-full border p-2 rounded" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#234C6A] text-white rounded">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {showEditModal && editingModule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Modifier Module</h2>
            <form className="space-y-3" onSubmit={handleEditSubmit}>
              <input placeholder="Code" className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              <input placeholder="Nom" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Crédits" type="number" className="w-full border p-2 rounded" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} required />
              <input placeholder="Heures" type="number" className="w-full border p-2 rounded" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} required />
              <input placeholder="Semestre" className="w-full border p-2 rounded" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#234C6A] text-white rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}













/*import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, GraduationCap, Clock, CheckCircle, X } from 'lucide-react';

interface Module {
  id: number;
  code: string;
  name: string;
  credits: number;
  hours: number;
  semester: string;
  isActive: boolean;
  description: string;
}

export default function ModulesPage() {
  const [moduleData, setModulesData] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '',
    hours: '',
    semester: '',
    isActive: true,
    description: '',
  });

  // Fetch modules from backend
  useEffect(() => {
    fetch("http://localhost:3400/api/modules", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModulesData(data);
        } else {
          console.error("Modules API did not return an array:", data);
          setModulesData([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Filtered modules based on search query
  const filteredModules = moduleData.filter(module => {
    const searchLower = searchQuery.toLowerCase();
    return (
      module.code.toLowerCase().includes(searchLower) ||
      module.name.toLowerCase().includes(searchLower) ||
      module.semester.toLowerCase().includes(searchLower) ||
      module.description.toLowerCase().includes(searchLower)
    );
  });

  // Statistics
  const totalCredits = filteredModules.reduce((sum, m) => sum + m.credits, 0);
  const totalHours = filteredModules.reduce((sum, m) => sum + m.hours, 0);
  const activeModules = filteredModules.filter(m => m.isActive).length;

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    const newModule: Module = {
      id: Math.max(...moduleData.map(m => m.id), 0) + 1,
      code: formData.code,
      name: formData.name,
      credits: parseInt(formData.credits),
      hours: parseInt(formData.hours),
      semester: formData.semester,
      isActive: formData.isActive,
      description: formData.description,
    };
    setModulesData([...moduleData, newModule]);
    setShowAddModal(false);
    setFormData({ code: '', name: '', credits: '', hours: '', semester: '', isActive: true, description: '' });
  };

  // Edit Module
  const handleEditClick = (module: Module) => {
    setEditingModule(module);
    setFormData({
      code: module.code,
      name: module.name,
      credits: module.credits.toString(),
      hours: module.hours.toString(),
      semester: module.semester,
      isActive: module.isActive,
      description: module.description,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      setModulesData(moduleData.map(module =>
        module.id === editingModule.id
          ? { ...module, ...formData, credits: parseInt(formData.credits), hours: parseInt(formData.hours) }
          : module
      ));
      setShowEditModal(false);
      setEditingModule(null);
      setFormData({ code: '', name: '', credits: '', hours: '', semester: '', isActive: true, description: '' });
    }
  };

  // Delete Module
  const handleDeleteModule = (moduleId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      setModulesData(moduleData.filter(module => module.id !== moduleId));
    }
  };

  // Toggle Active Status
  const toggleActiveStatus = (moduleId: number) => {
    setModulesData(moduleData.map(module =>
      module.id === moduleId
        ? { ...module, isActive: !module.isActive }
        : module
    ));
  };

  const getSemesterBadgeStyle = (semester: string) => {
    const semesterNum = semester.match(/\d+/)?.[0];
    switch (semesterNum) {
      case '1': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case '2': return 'bg-green-50 text-green-700 border border-green-200';
      case '3': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case '4': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case '5': return 'bg-pink-50 text-pink-700 border border-pink-200';
      case '6': return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header and Add Button 
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#1B3C53] mb-1">Gestion des Modules</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gérez les modules d'enseignement et leurs crédits.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#234C6A] text-white px-6 py-3 rounded-lg hover:bg-[#1B3C53] transition-all">
          <Plus className="w-5 h-5" /> Ajouter un Module
        </button>
      </div>

      {/* Search 
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par code, nom, semestre…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]/20 focus:border-[#234C6A]"
        />
      </div>

      {/* Statistics Cards 
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{filteredModules.length}</p>
            <p className="text-xs text-gray-600">Total Modules</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{activeModules}</p>
            <p className="text-xs text-gray-600">Modules Actifs</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{totalCredits}</p>
            <p className="text-xs text-gray-600">Total Crédits</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{totalHours}</p>
            <p className="text-xs text-gray-600">Total Heures</p>
          </div>
        </div>
      </div>

      {/* Modules Table
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Code</th>
              <th className="px-6 py-4 text-left text-sm">Nom</th>
              <th className="px-6 py-4 text-left text-sm">Semestre</th>
              <th className="px-6 py-4 text-center text-sm">Crédits</th>
              <th className="px-6 py-4 text-center text-sm">Heures</th>
              <th className="px-6 py-4 text-center text-sm">Statut</th>
              <th className="px-6 py-4 text-center text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.map(module => (
              <tr key={module.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">{module.code}</td>
                <td className="px-6 py-4">{module.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs ${getSemesterBadgeStyle(module.semester)}`}>
                    {module.semester}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{module.credits}</td>
                <td className="px-6 py-4 text-center">{module.hours}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleActiveStatus(module.id)} className={`px-3 py-1 rounded-lg text-xs ${module.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                    {module.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEditClick(module)} className="text-gray-600 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteModule(module.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filteredModules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Aucun module trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Module Modal 
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Ajouter un Module</h2>
            <form className="space-y-3" onSubmit={handleAddModule}>
              <input placeholder="Code" className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              <input placeholder="Nom" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Crédits" type="number" className="w-full border p-2 rounded" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} required />
              <input placeholder="Heures" type="number" className="w-full border p-2 rounded" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} required />
              <input placeholder="Semestre" className="w-full border p-2 rounded" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#234C6A] text-white rounded">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Modal 
      {showEditModal && editingModule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Modifier Module</h2>
            <form className="space-y-3" onSubmit={handleEditSubmit}>
              <input placeholder="Code" className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              <input placeholder="Nom" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Crédits" type="number" className="w-full border p-2 rounded" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} required />
              <input placeholder="Heures" type="number" className="w-full border p-2 rounded" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} required />
              <input placeholder="Semestre" className="w-full border p-2 rounded" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#234C6A] text-white rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
*/