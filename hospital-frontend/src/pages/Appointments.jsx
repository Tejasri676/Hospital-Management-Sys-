import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function AppointmentForm({ initialData, patients, doctors, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: '', time: '', 
    duration: 30, reason: '', height: '', weight: '',
    status: 'Pending Payment', is_followup: false, parentAppointmentId: '',
    is_referral: false, fee: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      
      // If it's a pre-fill from referral, try to set initial fee
      if (initialData.is_referral && doctors.length > 0) {
        const docId = initialData.doctorId || doctors[0].id;
        const targetDoc = doctors.find(d => d.id === parseInt(docId, 10));
        setFormData(prev => ({
           ...prev,
           doctorId: docId,
           fee: targetDoc ? targetDoc.consultation_fee : 0
        }));
      }
    }
  }, [initialData, doctors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: nextValue };
      
      // Auto-assign doctor if referral
      if (name === 'is_referral' && nextValue === true && doctors.length > 0) {
        updated.doctorId = doctors[0].id; // Mock selection logic
        toast('Referral active: Auto-assigned to ' + doctors[0].name, { icon: '🔄' });
      }
      
      // Zero fee if followup
      if (name === 'is_followup') {
        if (nextValue) {
          updated.fee = 0;
        } else {
          const doc = doctors.find(d => d.id === parseInt(updated.doctorId, 10));
          updated.fee = doc ? doc.consultation_fee : 0;
        }
      }
      
      // Update fee if doctor changes and it's not a followup
      if (name === 'doctorId' && !updated.is_followup) {
        const doc = doctors.find(d => d.id === parseInt(nextValue, 10));
        updated.fee = doc ? doc.consultation_fee : 0;
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patientId: parseInt(formData.patientId, 10),
      doctorId: parseInt(formData.doctorId, 10),
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6 transition-all duration-300 ease-in-out">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">{initialData?.id ? "Update Appointment" : "Create Appointment"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          
          {/* Linked Relationships */}
          <div className="col-span-full flex gap-6 mb-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" name="is_followup" checked={formData.is_followup} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
              <span>Is Follow-up Session</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" name="is_referral" checked={formData.is_referral} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
              <span>Sourced from Referral</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Patient</label>
            <select name="patientId" required value={formData.patientId} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50">
              <option value="" disabled>-- Patient Directory --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Doctor</label>
            <select name="doctorId" required value={formData.doctorId} onChange={handleChange} disabled={formData.is_referral} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 disabled:bg-indigo-50 disabled:text-indigo-800 disabled:font-medium disabled:cursor-not-allowed">
              <option value="" disabled>-- Available Doctors --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>)}
            </select>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-800 mb-1.5">Status Flow</label>
             <select name="status" required value={formData.status} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50">
               <option value="Pending Payment">Pending Payment</option>
               <option value="Scheduled">Scheduled</option>
               <option value="Completed">Completed</option>
               <option value="Cancelled">Cancelled</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Date</label>
            <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Time</label>
            <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Duration (mins)</label>
            <input type="number" name="duration" required value={formData.duration} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Reason for Visit</label>
            <input type="text" name="reason" required value={formData.reason} onChange={handleChange} placeholder="Chief complaint or procedure info..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-sm font-semibold text-gray-800 mb-1.5">Height (cm)</label>
               <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
             </div>
             <div className="flex-1">
               <label className="block text-sm font-semibold text-gray-800 mb-1.5">Weight (kg)</label>
               <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
             </div>
          </div>
        </div>

        <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
          <div className="text-xl font-bold text-gray-900 border border-gray-300 px-4 py-2 rounded-lg bg-gray-100/50">
             Calculated Fee: <span className={formData.is_followup ? "text-green-600" : "text-blue-600"}>${formData.fee}</span>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Go Back</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition-all">Save Appointment</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState('table'); 
  const [editingData, setEditingData] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [fDate, setFDate] = useState('');
  const [fDoc, setFDoc] = useState('');
  const [fPat, setFPat] = useState('');
  
  const { user } = useAuth();
  const canModify = [ROLES.ADMIN, ROLES.RECEPTIONIST].includes(user?.role);
  const location = useLocation();

  const loadData = async () => {
    const [appRes, patRes, docRes] = await Promise.all([
      mockApi.getAppointments(),
      mockApi.getPatients(),
      mockApi.getDoctors()
    ]);
    setAppointments(appRes);
    setPatients(patRes);
    setDoctors(docRes);
    
    // Referral pre-fill logic from Referrals page
    if (location.state?.prefill) {
      setEditingData(location.state.prefill);
      setView('form');
      // Clear state to prevent re-open on refresh
      window.history.replaceState({}, document.title);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveAppointment(data);
    toast.success('Appointment locked securely.');
    await loadData();
    setView('table');
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending Payment': 'bg-yellow-100 text-yellow-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    const css = colors[status] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${css}`}>{status}</span>;
  };

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">APT-{r.id}</span> },
    { header: 'Patient', render: (r) => {
        const p = patients.find(p=>p.id === r.patientId); 
        return <span className="font-semibold text-gray-900">{p ? p.name : 'Unknown User'}</span>; 
    }},
    { header: 'Physician', render: (r) => {
        const d = doctors.find(d=>d.id === r.doctorId);
        return <span className="text-gray-600">Dr. {d ? d.name : 'Unassigned'}</span>;
    }},
    { header: 'Schedule', render: (r) => (
        <div className="text-sm">
           <p className="font-medium">{r.date}</p>
           <p className="text-gray-500">{r.time} ({r.duration}m)</p>
        </div>
    )},
    { header: 'Fee', render: (r) => (
        <div className="text-sm">
           <p className={r.is_followup ? "text-green-600 font-bold" : "font-medium"}>${r.fee}</p>
           {r.is_followup && <p className="text-xs text-gray-400 tracking-tight">FOLLOW-UP</p>}
        </div>
    )},
    { header: 'Status', render: (r) => getStatusBadge(r.status) },
  ];

  const filteredData = useMemo(() => {
    let output = appointments;
    if (fDate) output = output.filter(a => a.date === fDate);
    if (fDoc) output = output.filter(a => a.doctorId.toString() === fDoc);
    if (fPat) output = output.filter(a => a.patientId.toString() === fPat);
    if (search) {
       output = output.filter(a => a.reason.toLowerCase().includes(search.toLowerCase()));
    }
    return output;
  }, [appointments, fDate, fDoc, fPat, search]);

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule mapping, financial flow, and patient intake.</p>
        </div>
        {canModify && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            <Plus className="w-4 h-4 mr-2" /> Book Appointment
          </button>
        )}
      </div>

      {view === 'form' ? (
        <AppointmentForm 
          initialData={editingData} 
          patients={patients}
          doctors={doctors}
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
        />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
            <span className="text-sm font-semibold text-gray-600 mr-2">Filter Data:</span>
            <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
            <select value={fDoc} onChange={e=>setFDoc(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 max-w-[200px]">
              <option value="">All Doctors</option>
              {doctors.map(d=><option key={d.id} value={d.id}>Dr. {d.name}</option>)}
            </select>
            <select value={fPat} onChange={e=>setFPat(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 max-w-[200px]">
              <option value="">All Patients</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => {setFDate(''); setFDoc(''); setFPat('');}} className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition cursor-pointer">
              Clear
            </button>
          </div>
          
          <Table 
            columns={columns} 
            data={filteredData} 
            searchQuery={search} 
            onSearchChange={setSearch}
            actions={canModify ? (row) => (
              <button onClick={() => { setEditingData(row); setView('form'); }} className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition">
                Modify
              </button>
            ) : undefined}
          />
        </>
      )}
    </div>
  );
}