import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import Table from '../components/common/Table';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/rolePermissions';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockToAdd, setStockToAdd] = useState('');
  const { user } = useAuth();
  
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canManageStock = [ROLES.PHARMACIST, ROLES.ADMIN].some(role => role.toLowerCase() === normalizedRole);

  const loadData = async () => {
    const data = await mockApi.getMedicines();
    setMedicines(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddStock = async (medicine) => {
    const addBy = Number(stockInputs[medicine.id] || 0);

    if (!addBy || addBy < 1) {
      toast.error('Enter stock quantity to add');
      return;
    }

    try {
      await mockApi.addMedicineStock(medicine.id, addBy);
      toast.success('Medicine stock updated');
      setStockInputs(prev => ({ ...prev, [medicine.id]: '' }));
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const handleBulkAddStock = async (e) => {
    e.preventDefault();

    const addBy = Number(stockToAdd || 0);
    if (!selectedMedicineId) {
      toast.error('Select a medicine');
      return;
    }
    if (!addBy || addBy < 1) {
      toast.error('Enter stock quantity to add');
      return;
    }

    try {
      await mockApi.addMedicineStock(selectedMedicineId, addBy);
      toast.success('Medicine stock updated');
      setSelectedMedicineId('');
      setStockToAdd('');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

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
    ...(canManageStock ? [{
      header: 'Add Stock',
      render: (r) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={stockInputs[r.id] || ''}
            onChange={(e) => setStockInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Qty"
          />
          <button
            type="button"
            onClick={() => handleAddStock(r)}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </button>
        </div>
      ),
    }] : []),
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

      {canManageStock && (
        <form onSubmit={handleBulkAddStock} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Medicine</label>
              <select
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select medicine to restock</option>
                {medicines.map(medicine => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} - current stock: {medicine.stock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Quantity</label>
              <input
                type="number"
                min="1"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Stock
            </button>
          </div>
        </form>
      )}

      <Table 
        columns={columns} 
        data={medicines.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()))} 
        searchQuery={search} 
        onSearchChange={setSearch}
      />
      
      {canManageStock && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div className="text-sm text-indigo-800">
            <p className="font-bold">Inventory Note:</p>
            <p className="opacity-80">Admins and pharmacists can add stock here. Stock is reduced when medicines are marked as purchased in Prescriptions.</p>
          </div>
        </div>
      )}
    </div>
  );
}
