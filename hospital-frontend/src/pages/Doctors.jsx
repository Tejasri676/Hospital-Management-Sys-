import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import Form from '../components/common/Form';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState('table');
  const [editingData, setEditingData] = useState(null);
  const [search, setSearch] = useState('');
  
  const { user } = useAuth();
  const canModify = [ROLES.ADMIN].includes(user?.role);

  const loadData = async () => {
    try {
      const data = await mockApi.getDoctors();
      setDoctors(data);
    } catch {
      toast.error('Failed to load doctors');
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadData();
    };

    run();
  }, []);

  const handleSave = async (data) => {
    try {
      // Validate required fields before saving
      if (!data.name || !data.name.trim()) {
        toast.error('Doctor name is required');
        return;
      }
      if (!data.specialization || !data.specialization.trim()) {
        toast.error('Specialization is required');
        return;
      }

      await mockApi.saveDoctor(data);
      toast.success(editingData ? 'Doctor updated successfully' : 'Doctor added successfully');
      await loadData();
      setEditingData(null);
      setView('table');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save doctor';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (doctor) => {
    try {
      await mockApi.removeDoctor(doctor.id);
      toast.success('Doctor deleted successfully');
      await loadData();
    } catch {
      toast.error('Failed to delete doctor');
    }
  };

  const formFields = [
    { name: 'name', label: 'Doctor Legal Name', required: true, type: 'text' },
    { name: 'specialization', label: 'Clinical Specialization', required: true, type: 'text' },
    { name: 'qualification', label: 'Qualification Titles', type: 'text' },
    { name: 'license_no', label: 'License Number', type: 'text' },
    { name: 'dept_id', label: 'Department ID', type: 'number' },
    { name: 'email', label: 'Work Email Address', type: 'email' },
    { name: 'consultation_fee', label: 'Consultation Fee', type: 'number' },
  ];

  const columns = [
    { header: 'Medical ID', render: (r) => <span className="text-gray-400 font-mono text-xs">DOC-{r.doctor_id}</span> },
    { header: 'Practitioner', render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { header: 'Department', render: (r) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{r.specialization}</span> },
    { header: 'Credentials', render: (r) => <span className="text-gray-600 block text-xs mt-0.5">{r.qualification}</span> },
    { header: 'License', render: (r) => <span className="text-gray-700">{r.license_no || 'Not provided'}</span> },
    { header: 'Dept ID', render: (r) => <span className="text-gray-500">{r.dept_id || 'N/A'}</span> },
    { header: 'Email', render: (r) => <span className="text-gray-500">{r.email || 'Not provided'}</span> },
    { header: 'Fee', render: (r) => <span className="text-green-700 font-medium">{r.consultation_fee ? `$${r.consultation_fee}` : 'N/A'}</span> },
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      (doctor.email || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Doctors Roster</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital medical personnel schedules and attributes.</p>
        </div>
        {canModify && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            <Plus className="w-4 h-4 mr-2" /> Onboard Doctor
          </button>
        )}
      </div>

      {view === 'form' ? (
        <Form 
          title={editingData ? "Update Practitioner Matrix" : "Onboard Practitioner"}
          fields={formFields}
          initialData={editingData}
          onSubmit={handleSave}
          onCancel={() => { setEditingData(null); setView('table'); }}
        />
      ) : (
        <Table 
          columns={columns}
          data={filteredDoctors}
          searchQuery={search}
          onSearchChange={setSearch}
          actions={canModify ? (row) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setEditingData(row); setView('form'); }}
                className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition"
              >
                Adjust Data
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="bg-white rounded border border-gray-200 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 font-medium text-xs transition"
              >
                Delete
              </button>
            </div>
          ) : undefined}
        />
      )}
    </div>
  );
}
