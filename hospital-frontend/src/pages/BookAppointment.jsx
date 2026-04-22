import React, { useState, useEffect } from 'react';
import { getPatients, getDoctors, createAppointment } from '../services/api';
import toast from 'react-hot-toast';
import { CalendarHeart } from 'lucide-react';

const BookAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, dRes] = await Promise.all([getPatients(), getDoctors()]);
        setPatients(pRes.data);
        setDoctors(dRes.data);
        
        if (pRes.data.length > 0 && dRes.data.length > 0) {
            setFormData(prev => ({
                ...prev,
                patient_id: pRes.data[0].patient_id,
                doctor_id: dRes.data[0].doctor_id
            }));
        }
      } catch (error) {
        toast.error("Failed to load dependency data");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createAppointment({
         patient_id: parseInt(formData.patient_id),
         doctor_id: parseInt(formData.doctor_id),
         date: formData.date
      });
      toast.success('Appointment booked successfully!');
      setFormData(prev => ({ ...prev, date: '' }));
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
           <div className="p-3 bg-violet-50 rounded-xl">
               <CalendarHeart className="w-6 h-6 text-violet-600" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-gray-500 text-sm mt-1">Schedule a meeting with a specialist.</p>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all appearance-none bg-white"
              value={formData.patient_id}
              onChange={e => setFormData({...formData, patient_id: e.target.value})}
            >
              {patients.length === 0 && <option value="">No patients available</option>}
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>{p.name} (ID: {p.patient_id})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all appearance-none bg-white"
              value={formData.doctor_id}
              onChange={e => setFormData({...formData, doctor_id: e.target.value})}
            >
              {doctors.length === 0 && <option value="">No doctors available</option>}
              {doctors.map(d => (
                <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || patients.length === 0 || doctors.length === 0}
            className="w-full bg-violet-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
