import React from 'react';
import { useAuth } from '../hooks/useAuth';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard';
import NurseDashboard from '../components/dashboards/NurseDashboard';
import LabDashboard from '../components/dashboards/LabDashboard';
import PharmacyDashboard from '../components/dashboards/PharmacyDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Receptionist':
        return <ReceptionistDashboard />;
      case 'Nurse':
        return <NurseDashboard />;
      case 'Lab Technician':
        return <LabDashboard />;
      case 'Pharmacist':
        return <PharmacyDashboard />;
      default:
        return (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
            No specific dashboard available for your role.
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="flex justify-between items-end">

        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Systems Live</span>
        </div>
      </div>

      {renderDashboardContent()}
    </div>
  );
}