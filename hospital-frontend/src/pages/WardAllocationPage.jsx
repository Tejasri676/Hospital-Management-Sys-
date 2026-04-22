import React, { useState, useEffect } from 'react';
import { getPatients, getWards, createAdmission } from '../services/api';
import toast from 'react-hot-toast';
import { Bed } from 'lucide-react';

const WardAllocationPage = () => {
    const [patients, setPatients] = useState([]);
    const [wards, setWards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        patient_id: '',
        bed_id: '',
        admit_date: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, wRes] = await Promise.all([getPatients(), getWards()]);
                setPatients(pRes.data);
                setWards(wRes.data);

                // Set initial default selection if data is present
                if (pRes.data.length > 0 && wRes.data.length > 0) {
                    const firstAvailBed = wRes.data.flatMap(w => w.beds).find(b => b.status === 'available');
                    setFormData(prev => ({
                        ...prev,
                        patient_id: pRes.data[0].patient_id,
                        bed_id: firstAvailBed ? firstAvailBed.bed_id : ''
                    }));
                }
            } catch (err) {
                toast.error("Error loading data");
            }
        };
        fetchData();
    }, []);

    const availableBeds = wards.flatMap(w => w.beds).filter(b => b.status === 'available');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createAdmission({
                patient_id: parseInt(formData.patient_id),
                bed_id: parseInt(formData.bed_id),
                admit_date: formData.admit_date
            });
            toast.success("Patient admitted to ward successfully!");
            // Refresh wards to update bed status
            const wRes = await getWards();
            setWards(wRes.data);
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to admit patient");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="p-3 bg-teal-50 rounded-xl">
                        <Bed className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ward Admission Allocation</h2>
                        <p className="text-gray-500 text-sm mt-1">Assign a patient to an available bed in a ward.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
                            value={formData.patient_id}
                            onChange={e => setFormData({...formData, patient_id: e.target.value})}
                        >
                            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Beds</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
                            value={formData.bed_id}
                            onChange={e => setFormData({...formData, bed_id: e.target.value})}
                        >
                            {availableBeds.length === 0 && <option value="">No beds available in any ward</option>}
                            {availableBeds.map(b => (
                                <option key={b.bed_id} value={b.bed_id}>
                                    Bed #{b.bed_id} (Ward: {wards.find(w => w.ward_id === b.ward_id)?.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admit Date & Time</label>
                        <input 
                            type="datetime-local" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                            value={formData.admit_date}
                            onChange={e => setFormData({...formData, admit_date: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || patients.length === 0 || availableBeds.length === 0}
                        className="w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Processing...' : 'Admit Patient'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WardAllocationPage;
