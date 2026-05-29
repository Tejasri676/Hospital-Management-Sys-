import React, { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle, Calendar, Activity } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/statcard';

export default function LabDashboard() {
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedTestsToday: 0,
    assignedToday: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const lab = await Promise.allSettled([mockApi.getLabTests()]);
      const labTests = lab[0].status === 'fulfilled' ? lab[0].value : [];
      const today = new Date().toISOString().split('T')[0];

      setStats({
        pendingTests: labTests.filter(item => item.status === 'Pending').length,
        completedTestsToday: labTests.filter(item => item.status === 'Completed' && item.date && item.date.startsWith(today)).length,
        assignedToday: labTests.filter(item => item.date && item.date.startsWith(today)).length,
        recentActivity: labTests.length
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Pending Lab Tests" value={stats.pendingTests} icon={FlaskConical} colorClass="bg-rose-50 text-rose-600" />
      <StatCard title="Completed Today" value={stats.completedTestsToday} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Tests Assigned Today" value={stats.assignedToday} icon={Calendar} colorClass="bg-blue-50 text-blue-600" />
      <StatCard title="Total Test Activity" value={stats.recentActivity} icon={Activity} colorClass="bg-indigo-50 text-indigo-600" />
    </div>
  );
}
