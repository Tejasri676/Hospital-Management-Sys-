import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/StatCard';

export default function PharmacyDashboard() {
  const [stats, setStats] = useState({
    lowStock: 0,
    prescriptionsToday: 0,
    dispensedToday: 0,
    pharmacyRevenue: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [meds, pres] = await Promise.all([
        mockApi.getMedicines(),
        mockApi.getPrescriptions()
      ]);

      const today = new Date().toISOString().split('T')[0];
      
      const medicinePrices = meds.reduce((acc, curr) => {
        acc[curr.id] = Number(curr.price || 0);
        return acc;
      }, {});

      let dispensedToday = 0;
      let pharmacyRevenue = 0;

      pres.forEach(p => {
        const isToday = p.date && p.date.startsWith(today);
        const presMeds = p.medicines || [];
        
        presMeds.forEach(m => {
          if (m.purchased) {
            if (isToday) {
              dispensedToday += Number(m.quantity || 0);
            }
            pharmacyRevenue += (Number(m.quantity || 0) * (medicinePrices[m.medicineId] || 0));
          }
        });
      });

      setStats({
        lowStock: meds.filter(m => Number(m.stock || 0) < 20).length,
        prescriptionsToday: pres.filter(p => p.date && p.date.startsWith(today)).length,
        dispensedToday,
        pharmacyRevenue
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Low Stock Medicines" value={stats.lowStock} icon={AlertTriangle} colorClass="bg-rose-50 text-rose-600" />
      <StatCard title="Prescriptions Today" value={stats.prescriptionsToday} icon={FileText} colorClass="bg-indigo-50 text-indigo-600" />
      <StatCard title="Medicines Dispensed Today" value={stats.dispensedToday} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Total Revenue" value={`$${stats.pharmacyRevenue.toFixed(0)}`} icon={DollarSign} colorClass="bg-teal-50 text-teal-600" />
    </div>
  );
}
