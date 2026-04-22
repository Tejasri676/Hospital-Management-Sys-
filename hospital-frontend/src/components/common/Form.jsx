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
                  placeholder={`Enter ${field.label.toLowerCase()}`}
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