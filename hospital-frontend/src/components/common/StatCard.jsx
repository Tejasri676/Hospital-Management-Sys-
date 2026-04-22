import React from 'react';

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

export default StatCard;
