import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  
  const isPharmacist = user?.role === ROLES.PHARMACIST || user?.role === ROLES.ADMIN;

  const loadData = async () => {
    const data = await mockApi.getMedicines();
    setMedicines(data);
  };

  useEffect(() => { loadData(); }, []);

  const columns = [
    { header: 'ID', render: (r) => <span className="text-gray-400 font-mono text-xs">MED-{r.id}</span> },
    { header: 'Medicine Name', render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { header: 'Stock Available', render: (r) => (
      <div className="flex items-center">
        <span className={`font-mono font-bold ${r.stock < 20 ? 'text-red-500' : 'text-gray-700'}`}>
          {r.stock}
        </span>
        {r.stock < 20 && <AlertTriangle className="w-3 h-3 ml-2 text-red-500" title="Low Stock" />}
      </div>
    )},
    { header: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${r.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {r.stock > 0 ? 'In Stock' : 'Out of Stock'}
      </span>
    )},
  ];

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Medicine Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage hospital pharmaceutical stock levels.</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl flex items-center">
          <Package className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-semibold text-blue-700">{medicines.length} Items Listed</span>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))} 
        searchQuery={search} 
        onSearchChange={setSearch}
      />
      
      {isPharmacist && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div className="text-sm text-indigo-800">
            <p className="font-bold">Pharmacist Note:</p>
            <p className="opacity-80">Stock is automatically reduced when medicines are marked as "Purchased" in the Prescriptions section.</p>
          </div>
        </div>
      )}
    </div>
  );
}