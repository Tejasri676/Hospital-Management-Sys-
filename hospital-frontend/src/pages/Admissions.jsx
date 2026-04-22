import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Bed, Plus, LogOut, ReceiptText, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

function AdmissionForm({ onSubmit, onCancel, patients, availableBeds, initialData }) {
  const [patientId, setPatientId] = useState(initialData?.patientId || '');
  const [bedId, setBedId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const bed = availableBeds.find(b => b.id === parseInt(bedId, 10));
    const payload = {
      patientId: parseInt(patientId, 10),
      bedId: bed.id,
      wardType: bed.wardType,
      bedNumber: bed.bedNumber,
      status: 'Admitted',
      dateAdmitted: new Date().toISOString().split('T')[0],
      dateDischarged: null,
      totalCost: 0
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6 animate-in zoom-in-95 duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4 flex items-center">
         <Plus className="w-5 h-5 mr-2 text-blue-600" /> New Patient Admission
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Patient Directory</label>
            <select 
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            >
              <option value="">Search & Select Patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Available Bed Allocation</label>
            <select 
              required
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            >
              <option value="">Choose Available Bed...</option>
              {availableBeds.map(b => (
                <option key={b.id} value={b.id}>
                  {b.wardType} | Bed: {b.bedNumber} | ${b.costPerDay}/day
                </option>
              ))}
            </select>
            {availableBeds.length === 0 && (
              <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Warning: No beds available in any ward</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button type="submit" disabled={availableBeds.length === 0} className="px-7 py-2.5 bg-blue-600 text-white rounded-lg text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50">Confirm Boarding</button>
        </div>
      </form>
    </div>
  );
}

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [dischargingId, setDischargingId] = useState(null);
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);

  const { user } = useAuth();
  const location = useLocation();
  const isAdminOrReceptionist = user?.role === ROLES.ADMIN || user?.role === ROLES.RECEPTIONIST;

  const loadData = async () => {
    const [admRes, patRes, bedRes] = await Promise.all([
      mockApi.getAdmissions(),
      mockApi.getPatients(),
      mockApi.getBeds()
    ]);
    setAdmissions(admRes);
    setPatients(patRes);
    setBeds(bedRes);

    if (location.state?.prefill) {
      setView('form');
      // prefill logic handled in AdmissionForm via initialData
      window.history.replaceState({}, document.title);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveAdmission(data);
    toast.success('Patient admitted and bed locked');
    await loadData();
    setView('table');
  };

  const confirmDischarge = async (e) => {
    e.preventDefault();
    await mockApi.dischargePatient(dischargingId, dischargeDate);
    toast.success('Patient discharged and billing finalized');
    setDischargingId(null);
    await loadData();
  };

  const availableBeds = beds.filter(b => b.isAvailable);

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">ADM-{r.id}</span> },
    { header: 'Patient', render: (r) => {
      const p = patients.find(pat => pat.id === r.patientId);
      return <span className="font-bold text-gray-900">{p ? p.name : 'Unknown'}</span>;
    }},
    { header: 'Ward / Bed', render: (r) => (
      <div className="text-xs">
        <p className="font-medium text-indigo-700">{r.wardType}</p>
        <p className="text-gray-500 font-mono">{r.bedNumber}</p>
      </div>
    )},
    { header: 'Timeline', render: (r) => (
      <div className="text-[11px] font-medium">
        <p className="text-blue-600">IN: {r.dateAdmitted}</p>
        {r.dateDischarged && <p className="text-green-600">OUT: {r.dateDischarged}</p>}
      </div>
    )},
    { header: 'Billing', render: (r) => (
      r.status === 'Discharged' ? (
        <span className="font-bold text-gray-900">${r.totalCost}</span>
      ) : (
        <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Active Stay</span>
      )
    )},
    { header: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${r.status === 'Admitted' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {r.status}
      </span>
    )},
    { header: 'Action', render: (r) => (
      isAdminOrReceptionist && r.status === 'Admitted' ? (
        <button 
          onClick={() => setDischargingId(r.id)}
          className="flex items-center text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 px-3 py-1 rounded border border-red-100 transition"
        >
          <LogOut className="w-3 h-3 mr-1" /> Discharge
        </button>
      ) : null
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -left-4 -bottom-4 opacity-5">
           <Bed className="w-24 h-24 text-blue-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Inpatient Ward Control
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time bed availability and admission billing lifecycle.</p>
        </div>
        {isAdminOrReceptionist && view === 'table' && (
          <button onClick={() => setView('form')} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition">
            <Plus className="w-4 h-4 mr-2" /> Admit New Patient
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Beds</p>
               <p className="text-xl font-bold text-gray-900">{beds.length}</p>
            </div>
            <Bed className="w-8 h-8 text-gray-100" />
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-green-500">
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p>
               <p className="text-xl font-bold text-green-600">{availableBeds.length}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
         </div>
      </div>

      {dischargingId && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
           <h4 className="font-bold text-red-900 mb-4 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" /> Finalizing Discharge Process
           </h4>
           <form onSubmit={confirmDischarge} className="flex flex-wrap gap-4 items-end">
              <div>
                 <label className="block text-xs font-bold text-red-700 mb-1 uppercase">Discharge Date</label>
                 <input 
                   type="date" 
                   required
                   value={dischargeDate}
                   onChange={(e) => setDischargeDate(e.target.value)}
                   className="border-red-300 rounded-lg text-sm p-2 bg-white focus:ring-red-500"
                 />
              </div>
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition">Complete & Invoice</button>
              <button type="button" onClick={() => setDischargingId(null)} className="px-4 py-2 text-gray-500 text-xs font-medium">Cancel</button>
              <div className="flex-1 text-right">
                 <p className="text-[10px] text-red-400 italic">* System will automatically calculate stay duration and room costs.</p>
              </div>
           </form>
        </div>
      )}

      {view === 'form' ? (
        <AdmissionForm 
          onSubmit={handleSave} 
          onCancel={() => setView('table')}
          patients={patients}
          availableBeds={availableBeds}
          initialData={location.state?.prefill}
        />
      ) : (
        <Table 
          columns={columns} 
          data={admissions} 
          searchQuery={search} 
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}