import React, { useState, useEffect } from 'react';
import { getPatients, getDoctors, getLabTests, createTestOrder } from '../services/api';
import toast from 'react-hot-toast';
import { FlaskConical } from 'lucide-react';

const LabTestPage = () => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        test_id: '',
        date: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, dRes, tRes] = await Promise.all([getPatients(), getDoctors(), getLabTests()]);
                setPatients(pRes.data);
                setDoctors(dRes.data);
                setLabTests(tRes.data);
                
                if (pRes.data.length > 0 && dRes.data.length > 0 && tRes.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        patient_id: pRes.data[0].patient_id,
                        doctor_id: dRes.data[0].doctor_id,
                        test_id: tRes.data[0].test_id
                    }));
                }
            } catch (err) {
                toast.error("Error loading mock data");
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createTestOrder({
                patient_id: parseInt(formData.patient_id),
                doctor_id: parseInt(formData.doctor_id),
                test_id: parseInt(formData.test_id),
                date: formData.date
            });
            toast.success("Lab test ordered successfully!");
            setFormData(prev => ({ ...prev, date: '' }));
        } catch (error) {
            toast.error("Failed to order lab test");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <FlaskConical className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Lab Test</h2>
                        <p className="text-gray-500 text-sm mt-1">Request a laboratory test for a patient.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
                            value={formData.patient_id}
                            onChange={e => setFormData({...formData, patient_id: e.target.value})}
                        >
                            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prescribing Doctor</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
                            value={formData.doctor_id}
                            onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                        >
                            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lab Test</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
                            value={formData.test_id}
                            onChange={e => setFormData({...formData, test_id: e.target.value})}
                        >
                            {labTests.map(t => <option key={t.test_id} value={t.test_id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Needed</label>
                        <input 
                            type="datetime-local" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || patients.length === 0}
                        className="w-full bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Processing...' : 'Order Test'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LabTestPage;
