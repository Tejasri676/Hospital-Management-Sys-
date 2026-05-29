import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus, Share2, FileText, MapPin, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';

function ReferralForm({ onSubmit, onCancel, patients }) {
  const [patientId, setPatientId] = useState('');
  const [referredTo, setReferredTo] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      patientId: parseInt(patientId, 10),
      referredTo,
      reason,
      date: new Date().toISOString().split('T')[0],
      nurseId: 'STAFF-NURSE'
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6 animate-in slide-in-from-top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">Create Hospital Referral</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Patient</label>
            <select 
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            >
              <option value="">Choose Patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Target Destination / Doctor</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Specialists Hospital - Cardiology Unit"
              value={referredTo}
              onChange={(e) => setReferredTo(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Clinical Reason for Referral</label>
            <textarea 
              required
              rows={3}
              placeholder="Detail specifically why the patient requires transfer or external consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 font-semibold">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button type="submit" className="px-7 py-2.5 bg-blue-600 text-white rounded-lg text-sm shadow-md hover:bg-blue-700 transition">Authorize Referral</button>
        </div>
      </form>
    </div>
  );
}

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();
  const isNurse = user?.role === ROLES.NURSE || user?.role === ROLES.ADMIN;
  const isReceptionistOrNurse = user?.role === ROLES.RECEPTIONIST || user?.role === ROLES.NURSE || user?.role === ROLES.ADMIN;

  const loadData = async () => {
    try {
      const [refRes, patRes] = await Promise.all([
        mockApi.getReferrals(),
        mockApi.getPatients()
      ]);
      setReferrals(refRes);
      setPatients(patRes);
    } catch (error) {
      toast.error(error.message || 'Failed to load referrals');
      setReferrals([]);
      setPatients([]);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveReferral(data);
    toast.success('Referral authorized and logged');
    await loadData();
    setView('table');
  };

  const handleCreateAppointment = (ref) => {
    // Navigate to appointments with referral context
    // In a real app, we'd use state or search params
    toast.success('Initiating Appointment Booking for Referral...');
    // Simulated navigation with state to pre-fill
    navigate('/appointments', { 
      state: { 
        prefill: {
          patientId: ref.patientId,
          reason: `REFERRAL: ${ref.reason}`,
          is_referral: true
        }
      } 
    });
  };

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">REF-{r.id}</span> },
    { header: 'Patient Profile', render: (r) => {
      const p = patients.find(pat => String(pat.id) === String(r.patientId));
      return (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{p ? p.name : 'Unknown Patient'}</span>
        </div>
      );
    }},
    { header: 'Referral Destination', render: (r) => (
      <div className="flex items-start text-indigo-700 font-medium max-w-xs">
        <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
        <span className="text-xs">{r.referredTo}</span>
      </div>
    )},
    { header: 'Date Issued', accessor: 'date' },
    { header: 'Clinical Rationale', render: (r) => (
      <div className="flex items-start text-xs text-gray-500 italic max-w-sm">
        <FileText className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-1">{r.reason}</span>
      </div>
    )},
    { header: 'Actions', render: (r) => (
      isReceptionistOrNurse ? (
        <button 
          onClick={() => handleCreateAppointment(r)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-bold underline bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors"
        >
          <CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Book Appointment
        </button>
      ) : null
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-blue-500/10 rounded-bl-3xl">
           <Share2 className="w-12 h-12 text-blue-500/20 -mr-4 -mt-4 rotate-12" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            Patient Referral Network
          </h1>
          <p className="text-sm text-gray-500 mt-1">External consultations and internal department transfers.</p>
        </div>
        {isNurse && view === 'table' && (
          <button onClick={() => setView('form')} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition">
            <Plus className="w-4 h-4 mr-2" /> Create Referral
          </button>
        )}
      </div>

      {view === 'form' ? (
        <ReferralForm 
          onSubmit={handleSave} 
          onCancel={() => setView('table')}
          patients={patients}
        />
      ) : (
        <Table 
          columns={columns} 
          data={referrals} 
          searchQuery={search} 
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}