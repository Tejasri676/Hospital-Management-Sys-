import React, { useState, useEffect } from 'react';
import { Users, UserPlus, FileText, CheckCircle, Calendar, Bed, Activity, FlaskConical } from 'lucide-react';

import { mockApi } from '../services/mockApi';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard';
import NurseDashboard from '../components/dashboards/NurseDashboard';
import LabDashboard from '../components/dashboards/LabDashboard';
import PharmacyDashboard from '../components/dashboards/PharmacyDashboard';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center p-6 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
    <div className={`p-4 rounded-xl ${colorClass} mr-6 bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-').replace('-50', '-500')}`} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    admissions: 0,
    referrals: 0,
    labTests: 0
  });
  const [priorityItems, setPriorityItems] = useState([]);

  const loadStats = async () => {
    const [p, d, app, adm, ref, lab] = await Promise.allSettled([
      mockApi.getPatients(),
      mockApi.getDoctors(),
      mockApi.getAppointments(),
      mockApi.getAdmissions(),
      mockApi.getReferrals(),
      mockApi.getLabTests(),
    ]);

    const patients = p.status === "fulfilled" ? p.value : [];
    const doctors = d.status === "fulfilled" ? d.value : [];
    const appointments = app.status === "fulfilled" ? app.value : [];
    const admissions = adm.status === "fulfilled" ? adm.value : [];
    const referrals = ref.status === "fulfilled" ? ref.value : [];
    const labTests = lab.status === "fulfilled" ? lab.value : [];

    setStats({
      patients: patients.length,
      doctors: doctors.length,
      appointments: appointments.length,
      admissions: admissions.filter((a) => a.status === "Admitted").length,
      referrals: referrals.length,
      labTests: labTests.filter((l) => l.status === "Pending").length,
    });

    const today = new Date().toISOString().split("T")[0];
    const appointmentById = new Map(
      appointments.map((item) => [String(item.id), item]),
    );
    const highPriority = labTests
      .filter((item) => item.status !== "Completed")
      .slice(0, 3)
      .map((item, index) => {
        const linkedAppointment = appointmentById.get(
          String(item.appointmentId),
        );
        const label =
          item.patientName ||
          linkedAppointment?.patientName ||
          `Case ${index + 1}`;
        return {
          id: item.id || index + 1,
          title: item.testName || "Lab Follow-up",
          subtitle: label,
          badge: item.status || "Pending",
          isToday: String(item.date || "").startsWith(today),
        };
      });

    setPriorityItems(highPriority);
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">
            Medicare Enterprise
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Real-time hospital operations overview.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">
            Systems Live
          </span>
        </div>
      </div>

      {(() => {
        switch (user?.role) {
          case ROLES.ADMIN:
            return <AdminDashboard />;
          case ROLES.RECEPTIONIST:
            return <ReceptionistDashboard />;
          case ROLES.NURSE:
            return <NurseDashboard />;
          case ROLES.LAB_TECH:
            return <LabDashboard />;
          case ROLES.PHARMACIST:
            return <PharmacyDashboard />;
          default:
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Patients"
                  value={stats.patients}
                  icon={Users}
                  colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                  title="Medical Staff"
                  value={stats.doctors}
                  icon={UserPlus}
                  colorClass="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                  title="Live Admissions"
                  value={stats.admissions}
                  icon={Bed}
                  colorClass="bg-purple-50 text-purple-600"
                />
                <StatCard
                  title="Queued Appointments"
                  value={stats.appointments}
                  icon={Calendar}
                  colorClass="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  title="Pending Lab Results"
                  value={stats.labTests}
                  icon={FlaskConical}
                  colorClass="bg-rose-50 text-rose-600"
                />
                <StatCard
                  title="Outgoing Referrals"
                  value={stats.referrals}
                  icon={FileText}
                  colorClass="bg-orange-50 text-orange-600"
                />
              </div>
            );
        }
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-32 h-32 text-blue-900" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
            <div className="w-2 h-8 bg-blue-600 rounded-full mr-3"></div>
            Bed Occupancy Trends
          </h2>
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="font-bold tracking-widest text-[10px] uppercase">
              Data Stream Initializing...
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-32 h-32 text-indigo-900" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
            <div className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></div>
            Today's High Priority
          </h2>
          <div className="space-y-4">
            {(priorityItems.length
              ? priorityItems
              : [
                  {
                    id: 1,
                    title: "No active alerts",
                    subtitle: "All major queues are clear",
                    badge: "Stable",
                    isToday: false,
                  },
                ]
            ).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                  #{String(idx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.isToday ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {item.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}