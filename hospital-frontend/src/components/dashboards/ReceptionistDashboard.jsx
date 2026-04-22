import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Bed, LogOut } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/StatCard';

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({
    patientsRegisteredToday: 0,
    appointmentsScheduledToday: 0,
    upcomingAppointments: 0,
    activeAdmissions: 0,
    dischargesToday: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [app, adm] = await Promise.all([
        mockApi.getAppointments(),
        mockApi.getAdmissions()
      ]);

      const today = new Date().toISOString().split('T')[0];

      setStats({
        patientsRegisteredToday: app.filter(a => a.date && a.date.startsWith(today) && !a.is_followup).length,
        appointmentsScheduledToday: app.filter(a => a.date && a.date.startsWith(today)).length,
        upcomingAppointments: app.filter(a => a.date && a.date >= today).length,
        activeAdmissions: adm.filter(a => a.status === 'Admitted').length,
        dischargesToday: adm.filter(a => a.dateDischarged && a.dateDischarged.startsWith(today)).length
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Patients Registered Today" value={stats.patientsRegisteredToday} icon={Users} colorClass="bg-blue-50 text-blue-600" />
      <StatCard title="Appointments Today" value={stats.appointmentsScheduledToday} icon={Calendar} colorClass="bg-indigo-50 text-indigo-600" />
      <StatCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={Clock} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Active Admissions" value={stats.activeAdmissions} icon={Bed} colorClass="bg-purple-50 text-purple-600" />
      <StatCard title="Discharges Today" value={stats.dischargesToday} icon={LogOut} colorClass="bg-rose-50 text-rose-600" />
    </div>
  );
}
