import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientDetails } from '../services/api';
import { User, Activity, FileText, FlaskConical, Bed } from 'lucide-react';

const PatientDetails = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getPatientDetails(id);
                setPatient(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-gray-500">Loading patient dossier...</div>;
    if (!patient) return <div className="text-center py-20 text-red-500">Patient not found</div>;

    const { history } = patient;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center text-3xl font-bold shadow-inner">
                    {patient.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 font-medium">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">ID: {patient.patient_id}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{patient.age} years old</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{patient.gender}</span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{patient.type}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Appointments History */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="bg-violet-50 px-6 py-4 border-b border-violet-100 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-violet-600" />
                        <h3 className="font-bold text-violet-900">Appointments</h3>
                    </div>
                    <div className="p-6 divide-y divide-gray-100">
                        {history.appointments.length === 0 ? <p className="text-gray-400 text-sm">No records found.</p> : null}
                        {history.appointments.map(app => (
                            <div key={app.app_id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Dr. {app.doctor_name}</p>
                                    <p className="text-xs text-gray-500">{new Date(app.date).toLocaleString()}</p>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-green-50 text-green-700 rounded-md">
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-900">Prescriptions</h3>
                    </div>
                    <div className="p-6 divide-y divide-gray-100">
                        {history.prescriptions.length === 0 ? <p className="text-gray-400 text-sm">No records found.</p> : null}
                        {history.prescriptions.map(pres => (
                            <div key={pres.pres_id} className="py-3">
                                <p className="text-xs text-gray-400 mb-1">From Appt ID: {pres.app_id}</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    {pres.medicines.map(m => (
                                        <li key={m.med_id} className="text-sm font-medium text-gray-700">
                                            {m.medicine_name} - <span className="text-gray-500 font-normal">{m.dosage}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lab Tests */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-amber-900">Lab Results</h3>
                    </div>
                    <div className="p-6">
                        {history.lab_orders.length === 0 ? <p className="text-gray-400 text-sm">No records found.</p> : null}
                        {history.lab_orders.map(order => (
                            <div key={order.order_id} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-gray-900">{order.test_name}</h4>
                                     <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">{order.status}</span>
                                </div>
                                {order.result ? (
                                    <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                        <p><strong>Result:</strong> {order.result.result}</p>
                                        <p><strong>Remarks:</strong> {order.result.remarks}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-2">Awaiting processing...</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admissions */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center gap-3">
                        <Bed className="w-5 h-5 text-rose-600" />
                        <h3 className="font-bold text-rose-900">Admissions</h3>
                    </div>
                    <div className="p-6 divide-y divide-gray-100">
                        {history.admissions.length === 0 ? <p className="text-gray-400 text-sm">No records found.</p> : null}
                        {history.admissions.map(adm => (
                            <div key={adm.admission_id} className="py-3">
                                <p className="text-sm font-medium text-gray-800">Bed ID: {adm.bed_id}</p>
                                <p className="text-xs text-gray-500">Admitted: {new Date(adm.admit_date).toLocaleString()}</p>
                                {adm.discharge_date && <p className="text-xs text-gray-500">Discharged: {new Date(adm.discharge_date).toLocaleString()}</p>}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PatientDetails;
