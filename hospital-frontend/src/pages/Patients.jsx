import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import Form from '../components/common/Form';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table'); 
  const [editingData, setEditingData] = useState(null);
  
  const { user } = useAuth();
  // Role verification mapping - only Receptionist can modify patients, Admin can only view
  const canModify = [ROLES.RECEPTIONIST].includes(user?.role);

  const loadData = async () => {
    const data = await mockApi.getPatients();
    setPatients(data);
    setFiltered(data);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p => 
      p.name.toLowerCase().includes(q) || p.phone.includes(q)
    ));
  }, [search, patients]);

  const handleSave = async (data) => {
    await mockApi.savePatient(data);
    toast.success('Patient updated successfully');
    await loadData();
    setView('table');
  };

  const formFields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    { name: 'address', label: 'Home Address' },
  ];

  const columns = [
    { header: 'Registry ID', render: (r) => <span className="text-gray-400">#PT{r.id.toString().padStart(4, '0')}</span> },
    { header: 'Patient Name', render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { header: 'Contact Phone', accessor: 'phone' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Age Tracker', render: (r) => <span className="text-gray-500">{new Date().getFullYear() - new Date(r.dob).getFullYear()} yr</span> },
    { header: 'Blood Group', render: (r) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{r.blood_group}</span> },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Locate records and execute hospital admission pathways.</p>
        </div>
        {canModify && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            <Plus className="w-4 h-4 mr-2" /> Add New Patient
          </button>
        )}
      </div>

      {view === 'form' ? (
        <Form 
          title={editingData ? "Edit Patient Data" : "Register Patient Profile"}
          fields={formFields} 
          initialData={editingData} 
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
        />
      ) : (
        <Table 
          columns={columns} 
          data={filtered} 
          searchQuery={search} 
          onSearchChange={setSearch}
          actions={canModify ? (row) => (
            <button onClick={() => { setEditingData(row); setView('form'); }} className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition">
              Modify
            </button>
          ) : undefined}
        />
      )}
    </div>
  );
}