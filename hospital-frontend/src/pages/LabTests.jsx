import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus, CheckSquare, Clock, FlaskConical, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function LabTestForm({ onSubmit, onCancel, appointments, patients, initialData }) {
  const [appointmentId, setAppointmentId] = useState(initialData?.appointmentId || '');
  const [testName, setTestName] = useState('');

  const completedAppointments = appointments.filter(app => app.status === 'Completed');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      appointmentId: parseInt(appointmentId, 10),
      testName,
      status: 'Pending',
      result: 'Awaiting values...',
      date: new Date().toISOString().split('T')[0],
      nurseId: 'STAFF-NURSE'
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">Request Lab Test</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Appointment</label>
            <select 
              required
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            >
              <option value="">Select Appointment...</option>
              {completedAppointments.map(app => {
                const p = patients.find(pat => pat.id === app.patientId);
                return <option key={app.id} value={app.id}>APT-{app.id} | {p?.name} | {app.date}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Test Type</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Glucose, Lipid Profile, etc."
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold transition hover:bg-blue-700">Submit Request</button>
        </div>
      </form>
    </div>
  );
}

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('table');
  const [updatingTest, setUpdatingTest] = useState(null);
  const [resultInput, setResultInput] = useState('');
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const isNurse = user?.role === ROLES.NURSE || user?.role === ROLES.ADMIN;
  const isLabTech = user?.role === ROLES.LAB_TECH || user?.role === ROLES.ADMIN;
  const location = useLocation();
  const [prefilledData, setPrefilledData] = useState(null);

  const loadData = async () => {
    const [testRes, appRes, patRes] = await Promise.all([
      mockApi.getLabTests(),
      mockApi.getAppointments(),
      mockApi.getPatients()
    ]);
    setTests(testRes);
    setAppointments(appRes);
    setPatients(patRes);

    if (location.state?.prefill) {
       setPrefilledData(location.state.prefill);
       setView('form');
       window.history.replaceState({}, document.title);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveLabTest(data);
    toast.success('Lab Test requested');
    await loadData();
    setView('table');
  };

  const handleStartProcess = async (id) => {
    await mockApi.updateLabStatus(id, 'In Progress', 'STAFF-LABTECH');
    toast.success('Test status updated to In Progress');
    await loadData();
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    await mockApi.updateLabResult(updatingTest.id, resultInput, 'STAFF-LABTECH');
    toast.success('Result uploaded and status completed');
    setUpdatingTest(null);
    setResultInput('');
    await loadData();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckSquare className="w-3 h-3 mr-1" />;
      case 'In Progress': return <Plus className="w-3 h-3 mr-1 animate-spin" />;
      case 'Pending': return <Clock className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">LAB-{r.id}</span> },
    { header: 'Patient', render: (r) => {
      const app = appointments.find(a => a.id === r.appointmentId);
      const p = patients.find(pat => pat.id === app?.patientId);
      return <span className="font-semibold text-gray-900">{p ? p.name : 'Unknown'}</span>;
    }},
    { header: 'Test Name', accessor: 'testName' },
    { header: 'Result', render: (r) => (
      <span className={r.status === 'Completed' ? 'text-gray-900 font-medium' : 'text-orange-500 italic'}>
        {r.result}
      </span>
    )},
    { header: 'Status', render: (r) => (
      <span className={`flex items-center text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(r.status)}`}>
        {getStatusIcon(r.status)}
        {r.status}
      </span>
    )},
    { header: 'Actions', render: (r) => (
      isLabTech ? (
        <div className="flex gap-2">
          {r.status === 'Pending' && (
            <button 
              onClick={() => handleStartProcess(r.id)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-bold"
              title="Set to In Progress"
            >
              <PlayCircle className="w-4 h-4 mr-1" /> Start
            </button>
          )}
          {(r.status === 'Pending' || r.status === 'In Progress') && (
            <button 
              onClick={() => { setUpdatingTest(r); setResultInput(''); }}
              className="text-green-600 hover:text-green-800 text-xs font-bold underline"
            >
              Upload Result
            </button>
          )}
        </div>
      ) : null
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <FlaskConical className="w-6 h-6 mr-2 text-blue-600" />
            Lab Diagnostic Tests
          </h1>
          <p className="text-sm text-gray-500 mt-1">Laboratory workflow and diagnostic result tracking.</p>
        </div>
        {isNurse && view === 'table' && (
          <button onClick={() => setView('form')} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition">
            <Plus className="w-4 h-4 mr-2" /> Request New Test
          </button>
        )}
      </div>

      {updatingTest && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl animate-in fade-in zoom-in-95">
          <h4 className="font-bold text-blue-900 mb-4 tracking-tight">Updating LAB-{updatingTest.id}: {updatingTest.testName}</h4>
          <form onSubmit={handleUpdateResult} className="flex gap-4">
            <input 
              type="text" 
              required
              placeholder="Enter laboratory result findings and upload..."
              value={resultInput}
              onChange={(e) => setResultInput(e.target.value)}
              className="flex-1 border-blue-300 rounded-lg text-sm p-2.5 bg-white focus:ring-blue-500"
            />
            <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold transition">Upload & Complete</button>
            <button type="button" onClick={() => setUpdatingTest(null)} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
          </form>
        </div>
      )}

      {view === 'form' ? (
        <LabTestForm 
          onSubmit={handleSave} 
          onCancel={() => setView('table')}
          appointments={appointments}
          patients={patients}
          initialData={prefilledData}
        />
      ) : (
        <Table 
          columns={columns} 
          data={tests} 
          searchQuery={search} 
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}