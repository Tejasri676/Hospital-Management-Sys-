const initialStaff = [
  { id: '1', staff_id: 'S001', name: 'Alice Admin', role: 'Admin', password: 'password' },
  { id: '2', staff_id: 'S002', name: 'Bob Reception', role: 'Receptionist', password: 'password' },
  { id: '3', staff_id: 'S003', name: 'Charlie Nurse', role: 'Nurse', password: 'password' },
  { id: '4', staff_id: 'S004', name: 'David Lab', role: 'Lab Technician', password: 'password' },
  { id: '5', staff_id: 'S005', name: 'Eve Pharma', role: 'Pharmacist', password: 'password' },
];

const initialDoctors = [
  { id: '1', name: 'Dr. John Smith', specialization: 'Cardiology', department: 'Cardio' },
  { id: '2', name: 'Dr. Sarah Connor', specialization: 'Neurology', department: 'Neuro' },
  { id: '3', name: 'Dr. Mike Tyson', specialization: 'Orthopedics', department: 'Ortho' },
];

const initialPatients = [
  { id: '1', name: 'James Wilson', phone: '1234567890', age: 35, gender: 'Male', address: '123 Main St' },
  { id: '2', name: 'Emily Clark', phone: '0987654321', age: 28, gender: 'Female', address: '456 Oak St' },
];

const initialAppointments = [
  { id: '1', patientId: '1', doctorId: '1', date: new Date().toISOString().split('T')[0], time: '10:00', status: 'Pending Payment', type: 'Consultation' },
];

const initialMedicines = [
  { id: '1', name: 'Paracetamol', stock: 100, price: 5, category: 'Painkiller' },
  { id: '2', name: 'Amoxicillin', stock: 50, price: 15, category: 'Antibiotic' },
  { id: '3', name: 'Ibuprofen', stock: 80, price: 8, category: 'Anti-inflammatory' },
];

const initialBeds = [
  { id: 'B01', ward: 'General', type: 'Normal', isAvailable: true, costPerDay: 500 },
  { id: 'B02', ward: 'General', type: 'Normal', isAvailable: true, costPerDay: 500 },
  { id: 'ICU01', ward: 'ICU', type: 'Intensive', isAvailable: false, costPerDay: 2000 },
];

const initialAdmissions = [];
const initialLabTests = [];
const initialPrescriptions = [];
const initialReferrals = [];

const defaultData = {
  staff: initialStaff,
  doctors: initialDoctors,
  patients: initialPatients,
  appointments: initialAppointments,
  medicines: initialMedicines,
  beds: initialBeds,
  admissions: initialAdmissions,
  labTests: initialLabTests,
  prescriptions: initialPrescriptions,
  referrals: initialReferrals,
};

export const initializeDB = () => {
  const isInitialized = localStorage.getItem('hms_initialized');
  if (!isInitialized) {
    Object.keys(defaultData).forEach((key) => {
      localStorage.setItem(`hms_${key}`, JSON.stringify(defaultData[key]));
    });
    localStorage.setItem('hms_initialized', 'true');
  }
};

export const getData = (collection) => {
  const data = localStorage.getItem(`hms_${collection}`);
  return data ? JSON.parse(data) : [];
};

export const saveData = (collection, data) => {
  localStorage.setItem(`hms_${collection}`, JSON.stringify(data));
};

// Generates a mock "unique" id using timestamp and random string
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const resetDB = () => {
    localStorage.removeItem('hms_initialized');
    initializeDB();
};
