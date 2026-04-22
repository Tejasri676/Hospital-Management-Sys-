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