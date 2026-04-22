import React, { useState } from 'react';
import { createDoctor } from '../services/api';
import toast from 'react-hot-toast';
import { Stethoscope } from 'lucide-react';

const AddDoctor = () => {
  const [formData, setFormData] = useState({ name: '', specialization_id: 1 });
  const [isLoading, setIsLoading] = useState(false);

  // Mock specializations corresponding to backend mockDB
  const specializations = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Neurology' },
    { id: 3, name: 'Pediatrics' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedSpecialization = specializations.find(
      (spec) => spec.id === Number(formData.specialization_id)
    );

    try {
      await createDoctor({
        name: formData.name.trim(),
        specialization: selectedSpecialization?.name || '',
      });
      toast.success('Doctor added successfully!');
      setFormData({ name: '', specialization_id: 1 });
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to add doctor';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
           <div className="p-3 bg-indigo-50 rounded-xl">
               <Stethoscope className="w-6 h-6 text-indigo-600" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Staff Doctor</h2>
              <p className="text-gray-500 text-sm mt-1">Register a new medical professional in the system.</p>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Dr. Jane Smith"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
              value={formData.specialization_id}
              onChange={e => setFormData({...formData, specialization_id: Number(e.target.value)})}
            >
              {specializations.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Saving...' : 'Add Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
