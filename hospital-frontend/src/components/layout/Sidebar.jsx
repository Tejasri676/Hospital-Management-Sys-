import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Calendar, Activity, Pill, UserCog, Stethoscope, 
  LayoutDashboard, BedDouble, FileText, History, Share2
} from 'lucide-react';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist'] },
  { path: '/patients', label: 'Patients', icon: Users, roles: ['Receptionist', 'Nurse', 'Admin'] },
  { path: '/appointments', label: 'Appointments', icon: Calendar, roles: ['Receptionist', 'Nurse', 'Admin'] },
  { path: '/admissions', label: 'Admissions', icon: BedDouble, roles: ['Receptionist', 'Nurse', 'Admin'] },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['Receptionist', 'Nurse', 'Admin'] },
  { path: '/patient-history', label: 'Patient History', icon: History, roles: ['Nurse', 'Admin'] },
  { path: '/prescriptions', label: 'Prescriptions', icon: FileText, roles: ['Nurse', 'Pharmacist', 'Admin'] },
  { path: '/medicines', label: 'Medicines', icon: Pill, roles: ['Pharmacist', 'Admin'] },
  { path: '/lab-tests', label: 'Laboratory', icon: Activity, roles: ['Lab Technician', 'Nurse', 'Admin'] },
  { path: '/referrals', label: 'Referrals', icon: Share2, roles: ['Nurse', 'Admin'] },
  { path: '/staff', label: 'Staff Management', icon: UserCog, roles: ['Admin'] },
];

export const Sidebar = () => {
  const { hasRole } = useRoleAccess();

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-wide border-b border-slate-800">
        <Activity className="text-blue-500 mr-2" />
        CareSync HMS
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors group text-sm font-medium ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
        &copy; 2026 CareSync HMS
      </div>
    </aside>
  );
};
