import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(srcDir, 'utils'));
ensureDir(path.join(srcDir, 'components', 'common'));
ensureDir(path.join(srcDir, 'services'));

// 1. rolePermissions.js
const rolePermissionsContent = `
export const ROLES = {
  ADMIN: 'Admin',
  RECEPTIONIST: 'Receptionist',
  NURSE: 'Nurse',
  LAB_TECH: 'Lab Technician',
  PHARMACIST: 'Pharmacist'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], // Admin has access to all routes
  [ROLES.RECEPTIONIST]: ['/dashboard', '/patients', '/appointments'],
  [ROLES.NURSE]: ['/dashboard', '/patients', '/prescriptions', '/lab-tests', '/referrals'],
  [ROLES.LAB_TECH]: ['/dashboard', '/lab-tests'],
  [ROLES.PHARMACIST]: ['/dashboard', '/medicines']
};

export const hasAccess = (role, path) => {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(path);
};
`;
fs.writeFileSync(path.join(srcDir, 'utils', 'rolePermissions.js'), rolePermissionsContent.trim());

// 2. ProtectedRoute.jsx
const protectedRouteContent = `
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAccess } from '../utils/rolePermissions';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const currentPath = \`/\${location.pathname.split('/')[1]}\`;
  
  if (!hasAccess(user.role, currentPath)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
`;
fs.writeFileSync(path.join(srcDir, 'components', 'ProtectedRoute.jsx'), protectedRouteContent.trim());

// 3. Login.jsx
const loginContent = `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState(ROLES.ADMIN);

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      staff_id: 'STAFF-' + Math.floor(Math.random() * 1000),
      name: 'System User',
      role: role
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
          Hospital Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Mock Login System - Test Role Abilities
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Access Level Selection</label>
              <div className="mt-1">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50 hover:bg-white transition-colors"
                >
                  {Object.values(ROLES).map(r => (
                    <option key={r} value={r}>{r} Context</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              Establish Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Login.jsx'), loginContent.trim());

// 4. Sidebar.jsx UPDATE
const sidebarContent = `
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
        MediCare Sys
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
                  \`flex items-center px-6 py-3 text-sm font-medium transition-colors \${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'hover:bg-gray-800 hover:text-white'
                  }\`
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
`;
fs.writeFileSync(path.join(srcDir, 'components', 'Sidebar.jsx'), sidebarContent.trim());

// 5. App.jsx UPDATE
const appContent = `
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import LabTests from './pages/LabTests';
import Medicines from './pages/Medicines';
import Admissions from './pages/Admissions';
import Referrals from './pages/Referrals';
import Staff from './pages/Staff';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
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
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appContent.trim());

// 6. Table.jsx
const tableContent = `
import React from 'react';
import { Search } from 'lucide-react';

export default function Table({ 
  columns, 
  data, 
  searchQuery, 
  onSearchChange,
  actions 
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      {onSearchChange !== undefined && (
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white text-sm"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">{col.header}</th>
              ))}
              {actions && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.length > 0 ? data.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50/80 transition-colors text-gray-700">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-16 text-center">
                  <span className="text-gray-400 font-medium">No records found matching criterion.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'components', 'common', 'Table.jsx'), tableContent.trim());

// 7. Form.jsx
const formContent = `
import React, { useState, useEffect } from 'react';

export default function Form({ fields, initialData, onSubmit, onCancel, title }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6 transition-all duration-300 ease-in-out">
      <h3 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">{title}</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                >
                  <option value="" disabled>Select option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                  placeholder={\`Enter \${field.label.toLowerCase()}\`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-gray-100">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
              Go Back
            </button>
          )}
          <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'components', 'common', 'Form.jsx'), formContent.trim());

// 8. mockApi.js
const mockApiContent = `
const delay = (ms) => new Promise(res => setTimeout(res, ms));

let patientsDb = [
  { id: 1, name: 'Alice Walker', phone: '555-0100', gender: 'Female', dob: '1990-05-15', blood_group: 'O+', address: '123 Elm St' },
  { id: 2, name: 'Bob Smith', phone: '555-0200', gender: 'Male', dob: '1985-11-20', blood_group: 'A-', address: '456 Oak St' },
];

let doctorsDb = [
  { id: 1, name: 'Dr. John Watson', specialization: 'Neurology', phone: '555-1000', email: 'john@hospital.com', gender: 'Male', qualification: 'MD, PhD', consultation_fee: 150 },
  { id: 2, name: 'Dr. Meredith Grey', specialization: 'Surgery', phone: '555-2000', email: 'meredith@hospital.com', gender: 'Female', qualification: 'MD', consultation_fee: 200 },
];

export const mockApi = {
  getPatients: async () => { await delay(300); return [...patientsDb]; },
  savePatient: async (patient) => { 
    await delay(300); 
    if (patient.id) {
      patientsDb = patientsDb.map(p => p.id === patient.id ? patient : p);
    } else {
      patient.id = Math.max(...patientsDb.map(p=>p.id), 0) + 1;
      patientsDb.push(patient);
    }
  },
  getDoctors: async () => { await delay(300); return [...doctorsDb]; },
  saveDoctor: async (doc) => { 
    await delay(300); 
    if (doc.id) {
      doctorsDb = doctorsDb.map(d => d.id === doc.id ? doc : d);
    } else {
      doc.id = Math.max(...doctorsDb.map(d=>d.id), 0) + 1;
      doctorsDb.push(doc);
    }
  }
};
`;
fs.writeFileSync(path.join(srcDir, 'services', 'mockApi.js'), mockApiContent.trim());

// 9. Patients.jsx
const patientsContent = `
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import Form from '../components/common/Form';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table'); 
  const [editingData, setEditingData] = useState(null);
  
  const { user } = useAuth();
  // Role verification mapping
  const canModify = [ROLES.ADMIN, ROLES.RECEPTIONIST].includes(user?.role);

  const loadData = async () => {
    const data = await mockApi.getPatients();
    setPatients(data);
    setFiltered(data);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p => 
      p.name.toLowerCase().includes(q) || p.phone.includes(q)
    ));
  }, [search, patients]);

  const handleSave = async (data) => {
    await mockApi.savePatient(data);
    toast.success('Patient updated successfully');
    await loadData();
    setView('table');
  };

  const formFields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    { name: 'address', label: 'Home Address' },
  ];

  const columns = [
    { header: 'Registry ID', render: (r) => <span className="text-gray-400">#PT{r.id.toString().padStart(4, '0')}</span> },
    { header: 'Patient Name', render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { header: 'Contact Phone', accessor: 'phone' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Age Tracker', render: (r) => <span className="text-gray-500">{new Date().getFullYear() - new Date(r.dob).getFullYear()} yr</span> },
    { header: 'Blood Group', render: (r) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{r.blood_group}</span> },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Locate records and execute hospital admission pathways.</p>
        </div>
        {canModify && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            <Plus className="w-4 h-4 mr-2" /> Add New Patient
          </button>
        )}
      </div>

      {view === 'form' ? (
        <Form 
          title={editingData ? "Edit Patient Data" : "Register Patient Profile"}
          fields={formFields} 
          initialData={editingData} 
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
        />
      ) : (
        <Table 
          columns={columns} 
          data={filtered} 
          searchQuery={search} 
          onSearchChange={setSearch}
          actions={canModify ? (row) => (
            <button onClick={() => { setEditingData(row); setView('form'); }} className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition">
              Modify
            </button>
          ) : undefined}
        />
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Patients.jsx'), patientsContent.trim());

// 10. Doctors.jsx
const doctorsContent = `
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import Form from '../components/common/Form';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState('table'); 
  const [editingData, setEditingData] = useState(null);
  
  const { user } = useAuth();
  const canModify = [ROLES.ADMIN].includes(user?.role);

  const loadData = async () => {
    const data = await mockApi.getDoctors();
    setDoctors(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data) => {
    await mockApi.saveDoctor(data);
    toast.success('Doctor roster updated');
    await loadData();
    setView('table');
  };

  const formFields = [
    { name: 'name', label: 'Doctor Legal Name', required: true },
    { name: 'specialization', label: 'Clinical Specialization', required: true },
    { name: 'qualification', label: 'Qualification Titles' },
    { name: 'email', label: 'Work Email Address', type: 'email' },
    { name: 'phone', label: 'Direct Line (Phone)', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'consultation_fee', label: 'Consultation Fee ($)', type: 'number' },
  ];

  const columns = [
    { header: 'Medical ID', render: (r) => <span className="text-gray-400 font-mono text-xs">DOC-{r.id}</span> },
    { header: 'Practitioner', render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { header: 'Department', render: (r) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{r.specialization}</span> },
    { header: 'Credentials', render: (r) => <span className="text-gray-600 block text-xs mt-0.5">{r.qualification}</span> },
    { header: 'Contact', render: (r) => <div className="text-xs"><p className="font-medium text-gray-700">{r.phone}</p><p className="text-gray-500">{r.email}</p></div> },
    { header: 'Fee Status', render: (r) => <span className="text-green-700 font-medium tracking-tight">$\${r.consultation_fee}</span> },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Doctors Roster</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital medical personnel schedules and attributes.</p>
        </div>
        {canModify && view === 'table' && (
          <button onClick={() => { setEditingData(null); setView('form'); }} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            <Plus className="w-4 h-4 mr-2" /> Onboard Doctor
          </button>
        )}
      </div>

      {view === 'form' ? (
        <Form 
          title={editingData ? "Update Practitioner Matrix" : "Onboard Practitioner"}
          fields={formFields} 
          initialData={editingData} 
          onSubmit={handleSave} 
          onCancel={() => setView('table')} 
        />
      ) : (
        <Table 
          columns={columns} 
          data={doctors} 
          actions={canModify ? (row) => (
            <button onClick={() => { setEditingData(row); setView('form'); }} className="bg-white rounded border border-gray-200 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-xs transition">
              Adjust Data
            </button>
          ) : undefined}
        />
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Doctors.jsx'), doctorsContent.trim());

// 11. RBAC Check placeholder pages
const generatePlaceholder = (name, requiredRole, actionText, infoMsg) => `
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';

export default function ${name.replace(/[^a-zA-Z]/g, '')}() {
  const { user } = useAuth();
  
  const targetRoles = ${JSON.stringify(requiredRole)};
  const canPerformAction = Array.isArray(targetRoles) 
    ? targetRoles.includes(user?.role) || user?.role === ROLES.ADMIN
    : user?.role === ROLES.ADMIN || user?.role === targetRoles;

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">${name} Infrastructure</h1>
          <p className="text-sm text-gray-500 mt-1">${infoMsg}</p>
        </div>
        {canPerformAction && (
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition">
            ${actionText}
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">${name} Secure Data View</h2>
        <p className="max-w-md">Data endpoints are functionally isolated. RBAC policy is aggressively enforced across views.</p>
        {!canPerformAction && (
          <div className="mt-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
            Security Policy: Your role ({user?.role}) operates this component in READ-ONLY mode.
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'pages', 'Appointments.jsx'), generatePlaceholder('Appointments', 'Receptionist', '+ Initialize Appointment', 'Intake queues and schedule allocations.').trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'Prescriptions.jsx'), generatePlaceholder('Prescriptions', 'Nurse', '+ Authorize Prescription', 'Secure e-prescribing validation network.').trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'LabTests.jsx'), generatePlaceholder('Laboratory Operations', ['Nurse', 'Lab Technician'], 'Update Validated Lab Test Result', 'Chemical and physical diagnostic evaluations.').trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'Referrals.jsx'), generatePlaceholder('Inter-departmental Referrals', 'Nurse', '+ Trigger Patient Referral', 'Network routing capabilities.').trim());
fs.writeFileSync(path.join(srcDir, 'pages', 'Medicines.jsx'), generatePlaceholder('Pharmacy & Stockpile', 'Pharmacist', 'Register Medicine Purchase Event', 'Manage drug distribution and dispensing flows.').trim());

console.log('Successfully injected RBAC architectures and dynamic Table/Form systems.');
