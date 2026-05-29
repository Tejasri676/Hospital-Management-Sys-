import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import StatCard from '../common/statcard';

export default function PharmacyDashboard() {
  const [stats, setStats] = useState({
    lowStock: 0,
    prescriptionsToday: 0,
    dispensedToday: 0,
    pharmacyRevenue: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [meds, pres] = await Promise.allSettled([
        mockApi.getMedicines(),
        mockApi.getPrescriptions()
      ]);

      const medicines = meds.status === 'fulfilled' ? meds.value : [];
      const prescriptions = pres.status === 'fulfilled' ? pres.value : [];

      const today = new Date().toISOString().split('T')[0];
      
      const medicinePrices = medicines.reduce((acc, current) => {
        acc[current.id] = Number(current.price || 0);
        return acc;
      }, {});

      let dispensedToday = 0;
      let pharmacyRevenue = 0;

      prescriptions.forEach(prescription => {
        const isToday = prescription.date && prescription.date.startsWith(today);
        const presMeds = prescription.medicines || [];
        
        presMeds.forEach(medicine => {
          if (medicine.purchased) {
            if (isToday) {
              dispensedToday += Number(medicine.quantity || 0);
            }
            pharmacyRevenue += (Number(medicine.quantity || 0) * (medicinePrices[medicine.medicineId] || 0));
          }
        });
      });

      setStats({
        lowStock: medicines.filter(medicine => Number(medicine.stock || 0) < 20).length,
        prescriptionsToday: prescriptions.filter(prescription => prescription.date && prescription.date.startsWith(today)).length,
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
