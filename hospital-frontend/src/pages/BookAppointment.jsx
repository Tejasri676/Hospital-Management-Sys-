import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarHeart } from 'lucide-react';

const BookAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    duration: 30,
    reason: '',
    status: 'Scheduled',
    is_followup: false,
    fee: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patients, doctors] = await Promise.all([
          mockApi.getPatients(),
          mockApi.getDoctors()
        ]);
        setPatients(patients);
        setDoctors(doctors);
        
        if (patients.length > 0 && doctors.length > 0) {
            setFormData(prev => ({
                ...prev,
                patientId: patients[0].id,
                doctorId: doctors[0].id,
                fee: doctors[0].consultation_fee || 0
            }));
        }
      } catch (error) {
        toast.error("Failed to load dependency data");
      }
    };
    fetchData();
  }, []);

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    setFormData(prev => ({
      ...prev,
      doctorId,
      fee: doctor ? doctor.consultation_fee : 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast.error('Date and time are required');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Reason for visit is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await mockApi.saveAppointment(formData);
      toast.success('Appointment booked successfully!');
      // Reset form
      setFormData(prev => ({
        ...prev,
        date: '',
        time: '',
        reason: '',
        status: 'Scheduled',
        is_followup: false
      }));
      // Navigate to appointments page after 1 second to show the new appointment
      setTimeout(() => {
        navigate('/appointments');
      }, 1000);
    } catch (error) {
      toast.error('Failed to book appointment: ' + error.message);
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
              value={formData.patientId}
              onChange={e => setFormData({...formData, patientId: e.target.value})}
            >
              {patients.length === 0 && <option value="">No patients available</option>}
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all appearance-none bg-white"
              value={formData.doctorId}
              onChange={e => handleDoctorChange(parseInt(e.target.value))}
            >
              {doctors.length === 0 && <option value="">No doctors available</option>}
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input 
              type="time" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
            <input 
              type="text"
              required
              placeholder="Chief complaint or procedure info..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              Consultation Fee: <span className="text-violet-600">${formData.fee}</span>
            </p>
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
