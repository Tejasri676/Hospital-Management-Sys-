import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

['components', 'pages', 'hooks', 'services', 'utils'].forEach(d => ensureDir(path.join(srcDir, d)));

const useAuthContent = `
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return { user, login, logout };
};
`;

const sidebarContent = `
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserRound, Calendar, Pill, 
  FlaskConical, Package, Bed, Share, UserCog
} from 'lucide-react';

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
  return (
    <div className="w-64 bg-gray-900 h-screen text-gray-300 flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-gray-800">
        MediCare Sys
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {LINKS.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  \`flex items-center px-6 py-3 text-sm font-medium transition-colors \${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-800 hover:text-white'
                  }\`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
`;

const navbarContent = `
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-xl font-semibold text-gray-800">
        Hospital Management Dashboard
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{user?.name || 'Staff User'}</span>
          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
            {user?.role || 'Admin'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`;

const layoutContent = `
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`;

const loginContent = `
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      staff_id: 'STAFF123',
      name: 'Dr. Jane Smith',
      role: 'Administrator'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <Activity className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hospital Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">
                Staff ID
              </label>
              <div className="mt-1">
                <input id="staff_id" name="staff_id" type="text" required defaultValue="STAFF123"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required defaultValue="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <button type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Sign in (Mock)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
`;

const dashboardContent = `
import React from 'react';
import { Users, UserPlus, FileText, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center p-6 transition-all hover:shadow-md">
    <div className={\`p-4 rounded-xl \${colorClass} mr-6 bg-opacity-10\`}>
      <Icon className={\`w-8 h-8 \${colorClass.replace('bg-', 'text-').replace('-50', '-500')}\`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value="1,248" icon={Users} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Total Doctors" value="64" icon={UserPlus} colorClass="bg-green-50 text-green-600" />
        <StatCard title="New Referrals" value="23" icon={FileText} colorClass="bg-orange-50 text-orange-600" />
        <StatCard title="Discharged Today" value="15" icon={CheckCircle} colorClass="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h2>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <Calendar className="w-10 h-10 mb-3 text-gray-300" />
             <p>No recent appointments to display</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hospital Capacity</h2>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <Bed className="w-10 h-10 mb-3 text-gray-300" />
             <p>Capacity data unavailable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Calendar, Bed } from 'lucide-react';
`;

const pages = [
  'Patients', 'Doctors', 'Appointments', 'Prescriptions', 
  'LabTests', 'Medicines', 'Admissions', 'Referrals', 'Staff'
];

const generatePlaceholder = (name) => `
import React from 'react';

export default function ${name}() {
  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">${name} Management</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to ${name}</h2>
        <p className="max-w-md">This is a placeholder page for ${name}. The dedicated functionalities and data sets will be implemented here.</p>
      </div>
    </div>
  );
}
`;

const appContent = `
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
${pages.map(p => `import ${p} from './pages/${p}';`).join('\n')}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/lab-tests" element={<LabTests />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/staff" element={<Staff />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'hooks', 'useAuth.js'), useAuthContent.trim());
fs.writeFileSync(path.join(srcDir, 'components', 'Sidebar.jsx'), sidebarContent.trim());
fs.writeFileSync(path.join(srcDir, 'components', 'Navbar.jsx'), navbarContent.trim());
fs.writeFileSync(path.join(srcDir, 'components', 'Layout.jsx'), layoutContent.trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'Login.jsx'), loginContent.trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), dashboardContent.trim());

pages.forEach(p => {
  fs.writeFileSync(path.join(srcDir, 'pages', `${p}.jsx`), generatePlaceholder(p).trim());
});

fs.writeFileSync(path.join(srcDir, 'App.jsx'), appContent.trim());

console.log('Successfully bootstrapped all frontend files.');
