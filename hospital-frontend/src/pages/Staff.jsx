import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import Form from '../components/common/Form';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { UserCog, Plus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [view, setView] = useState('table');
  const [editingData, setEditingData] = useState(null);
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const loadData = async () => {
    const data = await mockApi.getStaff();
    setStaff(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveStaff(data);
    toast.success('Staff record updated');
    await loadData();
    setView('table');
  };

  const formFields = [
    { name: 'name', label: 'Display Name', required: true },
    { name: 'role', label: 'System Access Role', type: 'select', options: Object.values(ROLES), required: true },
    { name: 'email', label: 'Contact Email', type: 'email' },
    { name: 'phone', label: 'Phone Number' },
  ];

  const columns = [
    { header: 'Internal ID', render: (r) => <span className="text-gray-400 font-mono text-xs">STF-{r.id}</span> },
    { header: 'Full Name', render: (r) => <span className="font-bold text-gray-900">{r.name}</span> },
    { header: 'Assigned Role', render: (r) => (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-100 uppercase">
        <ShieldCheck className="w-3 h-3 mr-1" /> {r.role}
      </span>
    )},
    { header: 'Email Address', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <UserCog className="w-6 h-6 mr-2 text-indigo-600" />
            Hospital Staff Authority
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage system access roles and professional profiles.</p>
        </div>
        {isAdmin && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition">
            <Plus className="w-4 h-4 mr-2" /> Add Staff Member
          </button>
        )}
      </div>

      {view === 'form' ? (
        <Form 
          title={editingData ? "Edit Staff Access" : "Register New Staff Member"}
          fields={formFields} 
          initialData={editingData} 
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
        />
      ) : (
        <Table 
          columns={columns} 
          data={staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))} 
          searchQuery={search} 
          onSearchChange={setSearch}
          actions={isAdmin ? (row) => (
            <button onClick={() => { setEditingData(row); setView('form'); }} className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition">
              Modify Access
            </button>
          ) : undefined}
        />
      )}
    </div>
  );
}