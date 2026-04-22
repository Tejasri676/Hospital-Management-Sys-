import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { History, Search, FileText, FlaskConical, Calendar, ArrowRight } from 'lucide-react';

export default function PatientHistory() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState({ prescriptions: [], labTests: [], appointments: [] });
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [medicinesList, setMedicinesList] = useState([]);
  const [search, setSearch] = useState('');

  const loadPatients = async () => {
    const data = await mockApi.getPatients();
    setPatients(data);
  };

  const loadMedicines = async () => {
    const data = await mockApi.getMedicines();
    setMedicinesList(data);
  };

  useEffect(() => {
    loadPatients();
    loadMedicines();
  }, []);

  const handleSelectPatient = async (p) => {
    setSelectedPatient(p);
    const [pres, labs, apps] = await Promise.all([
      mockApi.getPrescriptions(),
      mockApi.getLabTests(),
      mockApi.getAppointments()
    ]);

    // Filter by patient
    const patientApps = apps.filter(a => a.patientId === p.id);
    const appIds = patientApps.map(a => a.id);
    
    setHistory({
      appointments: patientApps,
      prescriptions: pres.filter(pr => appIds.includes(pr.appointmentId)),
      labTests: labs.filter(l => appIds.includes(l.appointmentId))
    });
    setActiveTab('prescriptions');
  };

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">PAT-{r.id}</span> },
    { header: 'Name', accessor: 'name' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Action', render: (r) => (
      <button 
        onClick={() => handleSelectPatient(r)}
        className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-bold transition-all group"
      >
        View History <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <History className="w-16 h-16 text-blue-900" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
          Patient Medical Archives
        </h1>
        <p className="text-sm text-gray-500 mt-1">Full longitudinal history including clinical diagnostics and pharmacology.</p>
      </div>

      {!selectedPatient ? (
        <Table 
          columns={columns} 
          data={patients} 
          searchQuery={search} 
          onSearchChange={setSearch}
        />
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <button 
            onClick={() => setSelectedPatient(null)}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center mb-4 transition"
          >
            ← Back to Directory
          </button>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedPatient.name}</h2>
                  <div className="flex gap-4 mt-2 text-blue-100 text-sm font-medium">
                    <span>{selectedPatient.gender}</span>
                    <span>•</span>
                    <span>DOB: {selectedPatient.dob}</span>
                    <span>•</span>
                    <span>BG: {selectedPatient.blood_group}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-widest">
                  Secure Access
                </div>
              </div>
            </div>

            <div className="px-8 border-b border-gray-100 flex gap-8">
               <button 
                 onClick={() => setActiveTab('prescriptions')}
                 className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'prescriptions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 <FileText className="w-4 h-4 mr-2" /> Drug Prescriptions ({history.prescriptions.length})
               </button>
               <button 
                 onClick={() => setActiveTab('lab_tests')}
                 className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'lab_tests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 <FlaskConical className="w-4 h-4 mr-2" /> Lab Diagnostics ({history.labTests.length})
               </button>
            </div>

            <div className="p-8 bg-gray-50/30">
               {activeTab === 'prescriptions' && (
                 <div className="space-y-6">
                    {history.prescriptions.length === 0 ? (
                      <p className="text-center py-12 text-gray-400 font-medium italic">No drug prescriptions found for this patient.</p>
                    ) : (
                      history.prescriptions.map(pres => {
                        const app = history.appointments.find(a => a.id === pres.appointmentId);
                        return (
                          <div key={pres.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                             <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-tighter">PRE-{pres.id}</span>
                                <span className="text-xs font-bold text-gray-400 flex items-center">
                                   <Calendar className="w-3 h-3 mr-1" /> {pres.date}
                                </span>
                             </div>
                             <p className="text-sm font-bold text-gray-800 mb-4 italic">"{app?.reason || 'Routine Checkup'}"</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pres.medicines.map((m, idx) => {
                                  const med = medicinesList.find(ml => ml.id === m.medicineId);
                                  return (
                                    <div key={idx} className="flex flex-col p-3 rounded-xl bg-gray-50 border border-gray-100">
                                       <span className="text-xs font-bold text-gray-900">{med?.name}</span>
                                       <span className="text-[10px] text-gray-500 mt-1">{m.frequency} | {m.duration} | Qty: {m.quantity}</span>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                        );
                      })
                    )}
                 </div>
               )}

               {activeTab === 'lab_tests' && (
                 <div className="space-y-6">
                    {history.labTests.length === 0 ? (
                      <p className="text-center py-12 text-gray-400 font-medium italic">No diagnostic records found for this patient.</p>
                    ) : (
                      history.labTests.map(test => (
                        <div key={test.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
                           {test.status === 'Completed' ? (
                             <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Done</div>
                           ) : (
                             <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl animate-pulse">Pending</div>
                           )}
                           <div className="mb-4">
                              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-tighter mr-2">LAB-{test.id}</span>
                              <span className="text-xs font-bold text-gray-400">{test.date}</span>
                           </div>
                           <h4 className="text-lg font-black text-gray-900 mb-2 tracking-tight">{test.testName}</h4>
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinical Findings</p>
                              <p className="text-sm text-gray-800 font-medium leading-relaxed">{test.result || 'Pending laboratory analysis...'}</p>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
