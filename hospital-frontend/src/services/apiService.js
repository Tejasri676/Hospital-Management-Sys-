import { getData, saveData, generateId } from '../utils/mockDatabase';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const createApiService = (collectionName) => {
  return {
    getAll: async () => {
      await delay();
      return getData(collectionName);
    },
    
    getById: async (id) => {
      await delay();
      const items = getData(collectionName);
      return items.find(item => item.id === id);
    },
    
    create: async (payload) => {
      await delay();
      const items = getData(collectionName);
      const newItem = { id: generateId(), ...payload };
      saveData(collectionName, [...items, newItem]);
      return newItem;
    },
    
    update: async (id, payload) => {
        await delay();
        const items = getData(collectionName);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');
        
        const updatedItem = { ...items[index], ...payload };
        items[index] = updatedItem;
        saveData(collectionName, items);
        return updatedItem;
    },
    
    delete: async (id) => {
        await delay();
        const items = getData(collectionName);
        const filteredItems = items.filter(item => item.id !== id);
        saveData(collectionName, filteredItems);
        return true;
    }
  };
};

// Export pre-configured services
export const patientService = createApiService('patients');
export const doctorService = createApiService('doctors');
export const staffService = createApiService('staff');
export const medicineService = createApiService('medicines');
export const bedService = createApiService('beds');
export const labService = createApiService('labTests');
export const prescriptionService = createApiService('prescriptions');
export const referralService = createApiService('referrals');

// Appointment service might need custom methods later, but generic start is good
export const appointmentService = createApiService('appointments');
export const admissionService = createApiService('admissions');
