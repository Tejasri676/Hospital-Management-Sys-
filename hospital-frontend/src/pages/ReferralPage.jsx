import React, { useState, useEffect } from 'react';
import { getPatients, getDoctors, createReferral } from '../services/api';
import toast from 'react-hot-toast';
import { Network } from 'lucide-react';

const ReferralPage = () => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        patient_id: '',
        from_doctor_id: '',
        to_doctor_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, dRes] = await Promise.all([getPatients(), getDoctors()]);
                setPatients(pRes.data);
                setDoctors(dRes.data);
                
                if (pRes.data.length > 0 && dRes.data.length >= 2) {
                    setFormData({
                        patient_id: pRes.data[0].patient_id,
                        from_doctor_id: dRes.data[0].doctor_id,
                        to_doctor_id: dRes.data[1].doctor_id
                    });
                }
            } catch (err) {
                toast.error("Error loading mock data");
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.from_doctor_id === formData.to_doctor_id) {
            toast.error("Cannot refer to the same doctor.");
            return;
        }

        setIsLoading(true);
        try {
            await createReferral({
                patient_id: parseInt(formData.patient_id),
                from_doctor_id: parseInt(formData.from_doctor_id),
                to_doctor_id: parseInt(formData.to_doctor_id)
            });
            toast.success("Referral created successfully!");
        } catch (error) {
            toast.error("Failed to create referral");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="p-3 bg-orange-50 rounded-xl">
                        <Network className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Referral</h2>
                        <p className="text-gray-500 text-sm mt-1">Refer a patient to another specialist.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                            value={formData.patient_id}
                            onChange={e => setFormData({...formData, patient_id: e.target.value})}
                        >
                            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Doctor</label>
                            <select 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                value={formData.from_doctor_id}
                                onChange={e => setFormData({...formData, from_doctor_id: e.target.value})}
                            >
                                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} ({d.specialization})</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Doctor</label>
                            <select 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                value={formData.to_doctor_id}
                                onChange={e => setFormData({...formData, to_doctor_id: e.target.value})}
                            >
                                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} ({d.specialization})</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || patients.length === 0 || doctors.length < 2}
                        className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Creating...' : 'Submit Referral'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReferralPage;
