import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserRound, Calendar, Pill,
  FlaskConical, Package, Bed, Share, UserCog
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { hasAccess } from '../utils/rolePermissions';

const LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Doctors', path: '/doctors', icon: UserRound },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
  { name: 'Lab Tests', path: '/lab-tests', icon: FlaskConical },
  { name: 'Medicines', path: '/medicines', icon: Package },
  { name: 'Admissions', path: '/admissions', icon: Bed },
  { name: 'Referrals', path: '/referrals', icon: Share },
  { name: 'Staff', path: '/staff', icon: UserCog },
];

export default function Sidebar() {
  const { user } = useAuth();

  // Filter sidebar routes using RBAC schema mapping
  const authorizedLinks = LINKS.filter(link => hasAccess(user?.role, link.path));

  return (
    <div className="w-64 bg-gray-900 h-screen text-gray-300 flex flex-col flex-shrink-0 transition-all">
      <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-gray-800">
        Priyamvada Healthcare
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {authorizedLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 opacity-90" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}