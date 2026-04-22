import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [role, setRole] = useState(ROLES.ADMIN);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      console.log('Login: User already authenticated, bypassing login screen');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login: Attempting session establishment for role', role);
    login({
      staff_id: 'STAFF-' + Math.floor(Math.random() * 1000),
      name: 'System User',
      role: role
    });
    // Navigation will be handled by useEffect or immediate call
    console.log('Login: Session established, navigating to dashboard');
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