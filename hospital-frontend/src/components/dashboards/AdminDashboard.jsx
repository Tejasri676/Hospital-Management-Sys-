import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Bed, Calendar, FlaskConical, FileText, DollarSign, Activity } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/StatCard';

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
      const [p, d, adm, app, lab, ref, meds, pres] = await Promise.all([
        mockApi.getPatients(),
        mockApi.getDoctors(),
        mockApi.getAdmissions(),
        mockApi.getAppointments(),
        mockApi.getLabTests(),
        mockApi.getReferrals(),
        mockApi.getMedicines(),
        mockApi.getPrescriptions()
      ]);

      const appointmentRevenue = app.reduce((sum, a) => sum + Number(a.fee || 0), 0);
      const admissionRevenue = adm.reduce((sum, a) => sum + Number(a.totalCost || 0), 0);
      
      const medicinePrices = meds.reduce((acc, curr) => {
        acc[curr.id] = Number(curr.price || 0);
        return acc;
      }, {});
      
      const pharmacyRevenue = pres.reduce((sum, p) => {
        const presMeds = p.medicines || [];
        const presSum = presMeds.filter(m => m.purchased).reduce((s, m) => {
          return s + (Number(m.quantity || 0) * (medicinePrices[m.medicineId] || 0));
        }, 0);
        return sum + presSum;
      }, 0);

      setStats({
        patients: p.length,
        doctors: d.length,
        activeAdmissions: adm.filter(a => a.status === 'Admitted').length,
        queuedAppointments: app.filter(a => a.status === 'Scheduled').length,
        pendingLabResults: lab.filter(l => l.status === 'Pending').length,
        outgoingReferrals: ref.length,
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
