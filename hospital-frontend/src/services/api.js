import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL,
  headers: {
    'Content-Type': 'application/json',
  }, 
});

export const getPatients = () => api.get('/patients/All');
export const createPatient = (data) => api.post('/patients', data);
export const getPatientDetails = (id) => api.get(`/patients/${id}`);

export const getDoctors = () => api.get('/doctors');
export const createDoctor = (data) => api.post('/doctors', data);

export const getAppointments = () => api.get('/appointments');
export const createAppointment = (data) => api.post('/appointments', data);

export const createPrescription = (data) => api.post('/prescriptions', data);
export const addMedicineToPrescription = (id, data) => api.post(`/prescriptions/${id}/medicines`, data);

export const getLabTests = () => api.get('/lab-tests');
export const createTestOrder = (data) => api.post('/lab-tests/order', data);
export const addTestResult = (data) => api.post('/lab-tests/result', data);

export const getWards = () => api.get('/wards');
export const createAdmission = (data) => api.post('/admissions', data);

export const createReferral = (data) => api.post('/referrals', data);

export default api;
