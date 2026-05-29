import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Bed, Calendar, FlaskConical, FileText, DollarSign, Activity } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/statcard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    activeAdmissions: 0,
    queuedAppointments: 0,
    pendingLabResults: 0,
    outgoingReferrals: 0,
    appointmentRevenue: 0,
    admissionRevenue: 0,
    pharmacyRevenue: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [p, d, adm, app, lab, ref, meds, pres] = await Promise.allSettled([
        mockApi.getPatients(),
        mockApi.getDoctors(),
        mockApi.getAdmissions(),
        mockApi.getAppointments(),
        mockApi.getLabTests(),
        mockApi.getReferrals(),
        mockApi.getMedicines(),
        mockApi.getPrescriptions()
      ]);

      const patients = p.status === 'fulfilled' ? p.value : [];
      const doctors = d.status === 'fulfilled' ? d.value : [];
      const admissions = adm.status === 'fulfilled' ? adm.value : [];
      const appointments = app.status === 'fulfilled' ? app.value : [];
      const labTests = lab.status === 'fulfilled' ? lab.value : [];
      const referrals = ref.status === 'fulfilled' ? ref.value : [];
      const medicines = meds.status === 'fulfilled' ? meds.value : [];
      const prescriptions = pres.status === 'fulfilled' ? pres.value : [];

      const appointmentRevenue = appointments.reduce((sum, item) => sum + Number(item.fee || item.consultation_fee || 0), 0);
      const admissionRevenue = admissions.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
      
      const medicinePrices = medicines.reduce((acc, current) => {
        acc[current.id] = Number(current.price || 0);
        return acc;
      }, {});
      
      const pharmacyRevenue = prescriptions.reduce((sum, prescription) => {
        const presMeds = prescription.medicines || [];
        const presSum = presMeds.filter(medicine => medicine.purchased).reduce((subTotal, medicine) => {
          return subTotal + (Number(medicine.quantity || 0) * (medicinePrices[medicine.medicineId] || 0));
        }, 0);
        return sum + presSum;
      }, 0);

      setStats({
        patients: patients.length,
        doctors: doctors.length,
        activeAdmissions: admissions.filter(item => item.status === 'Admitted').length,
        queuedAppointments: appointments.filter(item => item.status === 'Scheduled').length,
        pendingLabResults: labTests.filter(item => item.status === 'Pending').length,
        outgoingReferrals: referrals.length,
        appointmentRevenue,
        admissionRevenue,
        pharmacyRevenue
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Total Patients" value={stats.patients} icon={Users} colorClass="bg-blue-50 text-blue-600" />
      <StatCard title="Medical Staff" value={stats.doctors} icon={UserPlus} colorClass="bg-indigo-50 text-indigo-600" />
      <StatCard title="Active Admissions" value={stats.activeAdmissions} icon={Bed} colorClass="bg-purple-50 text-purple-600" />
      <StatCard title="Queued Appointments" value={stats.queuedAppointments} icon={Calendar} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Pending Lab Results" value={stats.pendingLabResults} icon={FlaskConical} colorClass="bg-rose-50 text-rose-600" />
      <StatCard title="Outgoing Referrals" value={stats.outgoingReferrals} icon={FileText} colorClass="bg-orange-50 text-orange-600" />
      <StatCard title="Appointment Rev" value={`$${stats.appointmentRevenue.toFixed(0)}`} icon={DollarSign} colorClass="bg-green-50 text-green-600" />
      <StatCard title="Admission Rev" value={`$${stats.admissionRevenue.toFixed(0)}`} icon={Activity} colorClass="bg-cyan-50 text-cyan-600" />
      <StatCard title="Pharmacy Rev" value={`$${stats.pharmacyRevenue.toFixed(0)}`} icon={DollarSign} colorClass="bg-teal-50 text-teal-600" />
    </div>
  );
}
