import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Bed, LogOut } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/statcard';

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
      const [app, adm] = await Promise.allSettled([
        mockApi.getAppointments(),
        mockApi.getAdmissions()
      ]);

      const appointments = app.status === 'fulfilled' ? app.value : [];
      const admissions = adm.status === 'fulfilled' ? adm.value : [];

      const today = new Date().toISOString().split('T')[0];

      setStats({
        patientsRegisteredToday: appointments.filter(item => item.date && item.date.startsWith(today) && !item.is_followup).length,
        appointmentsScheduledToday: appointments.filter(item => item.date && item.date.startsWith(today)).length,
        upcomingAppointments: appointments.filter(item => item.date && item.date >= today).length,
        activeAdmissions: admissions.filter(item => item.status === 'Admitted').length,
        dischargesToday: admissions.filter(item => item.dateDischarged && item.dateDischarged.startsWith(today)).length
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
