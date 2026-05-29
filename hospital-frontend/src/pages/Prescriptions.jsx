import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

function PrescriptionForm({ onSubmit, onCancel, patients, appointments, medicinesList }) {
  const [appointmentId, setAppointmentId] = useState('');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([
    { medicineId: '', quantity: '', duration: '', frequency: '', purchased: false }
  ]);

  const availableAppointments = appointments;

  const handleAddMedicine = () => {
    setPrescriptionMedicines([...prescriptionMedicines, { medicineId: '', quantity: '', duration: '', frequency: '', purchased: false }]);
  };

  const handleRemoveMedicine = (index) => {
    const newList = [...prescriptionMedicines];
    newList.splice(index, 1);
    setPrescriptionMedicines(newList);
  };

  const handleMedicineChange = (index, field, value) => {
    const newList = [...prescriptionMedicines];
    newList[index][field] = value;
    setPrescriptionMedicines(newList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appointmentId) {
      toast.error('Please select an appointment');
      return;
    }
    if (prescriptionMedicines.some(m => !m.medicineId || !m.quantity)) {
      toast.error('Please fill in all medicine details');
      return;
    }

    const payload = {
      appointmentId: parseInt(appointmentId, 10),
      date: new Date().toISOString().split('T')[0],
      medicines: prescriptionMedicines.map(m => ({
        ...m,
        medicineId: parseInt(m.medicineId, 10),
        quantity: parseInt(m.quantity, 10)
      }))
    };
    console.log('📤 Sending prescription payload:', payload);
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">Create New Prescription</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Appointment</label>
          <select 
            value={appointmentId} 
            onChange={(e) => setAppointmentId(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            required
          >
            <option value="">-- Choose Appointment --</option>
            {availableAppointments.map(app => {
              const p = patients.find(pat => String(pat.id) === String(app.patientId));
              return (
                <option key={app.id} value={app.id}>
                  APT-{app.id} | {p?.name} | {app.date} | {app.reason}
                </option>
              );
            })}
          </select>
          {availableAppointments.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No appointments available to prescribe for.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700 font-medium">Medicines</h4>
            <button 
              type="button" 
              onClick={handleAddMedicine}
              className="text-sm flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </button>
          </div>
          
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Medicine</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Frequency</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescriptionMedicines.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <select 
                        required
                        value={item.medicineId}
                        onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-sm p-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {medicinesList.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-sm p-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        placeholder="e.g. 5 days"
                        value={item.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-sm p-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        placeholder="e.g. 1-0-1"
                        value={item.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-sm p-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {prescriptionMedicines.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedicine(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition-all">Save Prescription</button>
        </div>
      </form>
    </div>
  );
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const isNurse = user?.role === ROLES.NURSE || user?.role === ROLES.ADMIN;
  const isPharmacist = user?.role === ROLES.PHARMACIST || user?.role === ROLES.ADMIN;

  const loadData = async () => {
    try {
      const [presRes, appRes, patRes, medRes] = await Promise.all([
        mockApi.getPrescriptions(),
        mockApi.getAvailableAppointments(),
        mockApi.getPatients(),
        mockApi.getMedicines()
      ]);
      setPrescriptions(presRes);
      setAppointments(appRes);
      setPatients(patRes);
      setMedicinesList(medRes);
    } catch (error) {
      toast.error(error.message || 'Failed to load prescription data');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.savePrescription(data);
    toast.success('Prescription created successfully');
    await loadData();
    setView('table');
  };

  const handleMarkPurchased = async (presId, medicineId) => {
    const result = await mockApi.markMedicinePurchased(presId, medicineId);
    if (result.success) {
      toast.success(result.message);
      await loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeletePrescription = async (presId) => {
    if (!window.confirm(`Delete prescription PRE-${presId}?`)) return;
    try {
      await mockApi.removePrescription(presId);
      toast.success('Prescription deleted successfully');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete prescription');
    }
  };

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">PRE-{r.id}</span> },
    { header: 'Patient', render: (r) => (
      <span className="font-semibold text-gray-900">{r.patientName || 'Unknown'}</span>
    )},
    { header: 'Date', accessor: 'date' },
    { header: 'Medicine Details', render: (r) => (
      <div className="space-y-1">
        {r.medicines && r.medicines.length > 0 ? (
          r.medicines.map((m, idx) => {
            return (
              <div key={idx} className="flex items-center text-xs justify-between gap-4 p-1 bg-gray-50 rounded">
                <span>{m.medicineName || m.medicine_name} {m.dosage ? `- ${m.dosage}` : ''} ({m.frequency})</span>
                {m.purchased ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="w-3 h-3 mr-0.5" /> Purchased
                  </span>
                ) : isPharmacist ? (
                  <button 
                    onClick={() => handleMarkPurchased(r.id, m.medicineId)}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-[10px] font-bold"
                  >
                    Mark Purchased
                  </button>
                ) : (
                  <span className="text-orange-500 font-medium italic">Pending</span>
                )}
              </div>
            );
          })
        ) : (
          <span className="text-gray-400 italic text-xs">No medicines added</span>
        )}
      </div>
    )},
    { header: 'Actions', render: (r) => (
      <div className="flex gap-2">
        {isNurse && (
           <button 
             onClick={() => navigate('/lab-tests', { state: { prefill: { appointmentId: r.appointmentId } } })}
             className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-bold border border-indigo-200 transition"
           >
             Request Lab Test
           </button>
        )}
        {isNurse && (
           <button 
             onClick={() => navigate('/admissions', { state: { prefill: { patientId: (appointments.find(a=>a.id===r.appointmentId))?.patientId } } })}
             className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-bold border border-green-200 transition"
           >
             Admit Patient
           </button>
        )}
        {isNurse && (
          <button
            onClick={() => handleDeletePrescription(r.id)}
            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold border border-red-200 transition inline-flex items-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Prescriptions Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dispense medication records for clinical treatments.</p>
        </div>
        {isNurse && view === 'table' && (
          <button onClick={() => setView('form')} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition">
            <Plus className="w-4 h-4 mr-2" /> Create Prescription
          </button>
        )}
      </div>

      {view === 'form' ? (
        <PrescriptionForm 
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
          patients={patients}
          appointments={appointments}
          medicinesList={medicinesList}
        />
      ) : (
        <Table 
          columns={columns} 
          data={prescriptions} 
          searchQuery={search} 
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}