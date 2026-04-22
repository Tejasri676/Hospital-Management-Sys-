import React, { useState, useEffect } from 'react';
import { Bed, Activity, FlaskConical, FileText, CheckCircle, LogOut } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/StatCard';

export default function NurseDashboard() {
  const [stats, setStats] = useState({
    currentlyAdmitted: 0,
    bedsOccupied: 0,
    pendingLabTests: 0,
    referralsCreated: 0,
    recentAdmissions: 0,
    pendingDischarges: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [adm, lab, ref] = await Promise.all([
        mockApi.getAdmissions(),
        mockApi.getLabTests(),
        mockApi.getReferrals()
      ]);

      const activeAdmissions = adm.filter(a => a.status === 'Admitted').length;

      setStats({
        currentlyAdmitted: activeAdmissions,
        bedsOccupied: activeAdmissions,
        pendingLabTests: lab.filter(l => l.status === 'Pending').length,
        referralsCreated: ref.length,
        recentAdmissions: adm.length,
        pendingDischarges: adm.filter(a => a.status === 'Admitted' && a.dateDischarged).length
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Patients Admitted" value={stats.currentlyAdmitted} icon={Bed} colorClass="bg-blue-50 text-blue-600" />
      <StatCard title="Beds Occupied" value={stats.bedsOccupied} icon={Activity} colorClass="bg-indigo-50 text-indigo-600" />
      <StatCard title="Pending Lab Tests" value={stats.pendingLabTests} icon={FlaskConical} colorClass="bg-rose-50 text-rose-600" />
      <StatCard title="Referrals Created" value={stats.referralsCreated} icon={FileText} colorClass="bg-orange-50 text-orange-600" />
      <StatCard title="Total Admissions" value={stats.recentAdmissions} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Pending Discharges" value={stats.pendingDischarges} icon={LogOut} colorClass="bg-purple-50 text-purple-600" />
    </div>
  );
}
