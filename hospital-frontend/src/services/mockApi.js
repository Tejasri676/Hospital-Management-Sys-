import api from './api';

const calculateAge = (dob) => {
  if (!dob) return '';

  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
};

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.beds)) return payload.beds;

  return [];
};

const getData = async (request) => {
  const response = await request;
  return response.data;
};

const splitDateTime = (value) => {
  if (!value) {
    return { date: '', time: '' };
  }

  if (typeof value === 'string' && value.includes('T')) {
    const [date, time] = value.split('T');
    return { date, time: (time || '').slice(0, 5) };
  }

  return { date: value, time: '' };
};

const formatDateTime = (date, time) => {
  if (!date) return '';
  if (!time) return date;
  return `${date}T${time}`;
};

const normalizePatient = (raw) => {
  if (!raw) return null;

  const normalizedRaw = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  const getString = (...keys) => {
    for (const key of keys) {
      const value = normalizedRaw[key.toLowerCase()];
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
    return '';
  };

  const name = getString('name', 'patient_name');
  if (!name) {
    return null;
  }

  return {
    id: normalizedRaw.patient_id ?? normalizedRaw.id ?? normalizedRaw.patientid,
    patient_id: normalizedRaw.patient_id ?? normalizedRaw.id ?? normalizedRaw.patientid,
    name,
    phone: getString('phone', 'contact_number'),
    gender: getString('gender'),
    dob: getString('dob', 'date_of_birth'),
    blood_group: getString('blood_group', 'bloodGroup'),
    address: getString('address'),
    type: getString('type', 'patient_type'),
    age: normalizedRaw.age ?? calculateAge(getString('dob', 'date_of_birth')),
  };
};

const normalizeDoctor = (raw) => {
  if (!raw) return null;

  const normalizedRaw = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  const getString = (...keys) => {
    for (const key of keys) {
      const value = normalizedRaw[key.toLowerCase()];
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
    return '';
  };

  const name = getString('name', 'doctor_name');
  if (!name) {
    return null;
  }

  return {
    id: normalizedRaw.doctor_id ?? normalizedRaw.id ?? normalizedRaw.doctorid,
    doctor_id: normalizedRaw.doctor_id ?? normalizedRaw.id ?? normalizedRaw.doctorid,
    name,
    specialization: getString('specialization', 'specialization_name', 'department'),
    qualification: getString('qualification'),
    license_no: getString('license_no', 'licenseNo', 'licence_no'),
    dept_id: normalizedRaw.dept_id ?? normalizedRaw.deptid ?? '',
    email: getString('email'),
    consultation_fee: Number(normalizedRaw.consultation_fee ?? normalizedRaw.fee ?? 0),
  };
};

const normalizeAppointment = (raw) => {
  if (!raw) return null;

  const normalizedRaw = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  const dateTime = splitDateTime(normalizedRaw.appt_date ?? normalizedRaw.date_time ?? normalizedRaw.datetime ?? normalizedRaw.date);

  return {
    id: normalizedRaw.appt_id ?? normalizedRaw.id ?? normalizedRaw.app_id ?? normalizedRaw.appointment_id,
    patientId: normalizedRaw.patient_id ?? normalizedRaw.patientid,
    doctorId: normalizedRaw.doctor_id ?? normalizedRaw.doctorid,
    date: dateTime.date,
    time: normalizedRaw.appt_time ?? dateTime.time,
    duration: Number(normalizedRaw.duration_mins ?? normalizedRaw.duration ?? 30),
    reason: normalizedRaw.reason ?? normalizedRaw.notes ?? '',
    height: normalizedRaw.height ?? '',
    weight: normalizedRaw.weight ?? '',
    status: normalizedRaw.status ?? 'Scheduled',
    is_followup: Boolean(normalizedRaw.is_followup ?? normalizedRaw.isfollowup ?? false),
    is_referral: Boolean(normalizedRaw.is_referral ?? false),
    fee: Number(normalizedRaw.consultation_fee ?? normalizedRaw.fee ?? 0),
    parentAppointmentId: normalizedRaw.parent_appointment_id ?? normalizedRaw.parentappointmentid ?? '',
  };
};

const normalizeMedicine = (raw) => ({
  id: raw.id ?? raw.med_id ?? raw.medicine_id,
  name: raw.name ?? raw.medicine_name ?? '',
  stock: Number(raw.stock ?? raw.quantity_in_stock ?? 0),
  price: Number(raw.price ?? 0),
  category: raw.category ?? '',
});

const normalizePrescriptionMedicine = (raw) => ({
  medicineId: raw.medicineId ?? raw.medicine_id ?? raw.med_id,
  quantity: Number(raw.quantity ?? 0),
  duration: raw.duration ?? '',
  frequency: raw.frequency ?? raw.dosage ?? '',
  purchased: Boolean(raw.purchased ?? false),
});

const normalizePrescription = (raw) => ({
  id: raw.id ?? raw.pres_id ?? raw.prescription_id,
  appointmentId: raw.appointmentId ?? raw.app_id ?? raw.appointment_id,
  date: raw.date ?? raw.created_at ?? '',
  medicines: ensureArray(raw.medicines).map(normalizePrescriptionMedicine),
});

const normalizeLabTest = (raw) => ({
  id: raw.id ?? raw.order_id ?? raw.test_id,
  appointmentId: raw.appointmentId ?? raw.app_id ?? raw.appointment_id ?? '',
  patientId: raw.patientId ?? raw.patient_id ?? '',
  doctorId: raw.doctorId ?? raw.doctor_id ?? '',
  testName: raw.testName ?? raw.test_name ?? raw.name ?? '',
  status: raw.status ?? 'Pending',
  result: typeof raw.result === 'object' ? raw.result?.result ?? '' : raw.result ?? '',
  remarks: typeof raw.result === 'object' ? raw.result?.remarks ?? '' : raw.remarks ?? '',
  date: raw.date ?? raw.created_at ?? '',
});

const normalizeReferral = (raw) => ({
  id: raw.id ?? raw.referral_id,
  patientId: raw.patientId ?? raw.patient_id,
  referredTo:
    raw.referredTo ??
    raw.referred_to ??
    raw.to_doctor_name ??
    raw.to_department ??
    raw.destination ??
    '',
  reason: raw.reason ?? raw.notes ?? '',
  date: raw.date ?? raw.created_at ?? '',
  nurseId: raw.nurseId ?? raw.nurse_id ?? '',
});

const normalizeBed = (raw) => ({
  id: raw.id ?? raw.bed_id,
  bed_id: raw.bed_id ?? raw.id,
  wardType: raw.wardType ?? raw.ward_type ?? raw.ward ?? '',
  bedNumber: raw.bedNumber ?? raw.bed_number ?? raw.bed_no ?? '',
  isAvailable: Boolean(raw.isAvailable ?? raw.is_available ?? false),
  costPerDay: Number(raw.costPerDay ?? raw.cost_per_day ?? 0),
});

const normalizeAdmission = (raw) => ({
  id: raw.id ?? raw.admission_id,
  patientId: raw.patientId ?? raw.patient_id,
  bedId: raw.bedId ?? raw.bed_id,
  wardType: raw.wardType ?? raw.ward_type ?? '',
  bedNumber: raw.bedNumber ?? raw.bed_number ?? '',
  status: raw.status ?? 'Admitted',
  dateAdmitted: raw.dateAdmitted ?? raw.admit_date ?? raw.admitted_at ?? '',
  dateDischarged: raw.dateDischarged ?? raw.discharge_date ?? raw.discharged_at ?? null,
  totalCost: Number(raw.totalCost ?? raw.total_cost ?? 0),
});

const normalizeStaff = (raw) => ({
  id: raw.id ?? raw.staff_id,
  name: raw.name ?? '',
  role: raw.role ?? '',
  email: raw.email ?? '',
  phone: raw.phone ?? '',
});

const patientPayload = (data) => ({
  name: data.name,
  phone: data.phone,
  gender: data.gender,
  dob: data.dob,
  blood_group: data.blood_group,
  address: data.address,
  age: data.age ? Number(data.age) : undefined,
  type: data.type,
});

const doctorPayload = (data) => {
  // Validate required fields
  if (!data.name || !data.name.trim()) {
    throw new Error('Doctor name is required');
  }
  if (!data.specialization || !data.specialization.trim()) {
    throw new Error('Specialization is required');
  }

  return {
    name: data.name.trim(),
    specialization: data.specialization.trim(),
    qualification: data.qualification?.trim() || null,
    license_no: data.license_no?.trim() || null,
    dept_id: data.dept_id ? Number(data.dept_id) : null,
    email: data.email?.trim() || null,
    consultation_fee: data.consultation_fee ? Number(data.consultation_fee) : null,
  };
};

const appointmentPayload = (data) => ({
  patient_id: Number(data.patientId),
  doctor_id: Number(data.doctorId),
  date: data.date,
  time: data.time,
  duration: Number(data.duration ?? 30),
  reason: data.reason,
  height: data.height ? Number(data.height) : undefined,
  weight: data.weight ? Number(data.weight) : undefined,
  status: data.status,
  is_followup: Boolean(data.is_followup),
  fee: Number(data.fee ?? 0),
  parent_appointment_id: data.parentAppointmentId || undefined,
});

const prescriptionPayload = (data) => ({
  appointment_id: Number(data.appointmentId),
  date: data.date,
});

const createOrUpdate = async (resource, id, payload) => {
  try {
    if (id) {
      const response = await api.put(`/${resource}/${id}`, payload);
      return response.data;
    }

    const response = await api.post(`/${resource}`, payload);
    return response.data;
  } catch (error) {
    // Pass through API error message if available
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const mockApi = {
  getPatients: async () => {
    const data = await getData(api.get('/patients/All'));
    return ensureArray(data)
      .map(normalizePatient)
      .filter(patient => patient !== null && patient.name);
  },

  savePatient: async (patient) => createOrUpdate('patients', patient.id, patientPayload(patient)),

  getDoctors: async () => {
    const data = await getData(api.get('/doctors'));
    return ensureArray(data)
      .map(normalizeDoctor)
      .filter(doctor => doctor !== null && doctor.name);
  },

  saveDoctor: async (doctor) => createOrUpdate('doctors', doctor.id, doctorPayload(doctor)),

  removeDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  getAppointments: async () => {
    const data = await getData(api.get('/appointments'));
    return ensureArray(data).map(normalizeAppointment);
  },

  saveAppointment: async (appointment) =>
    createOrUpdate('appointments', appointment.id, appointmentPayload(appointment)),

  getMedicines: async () => {
    const data = await getData(api.get('/medicines'));
    return ensureArray(data).map(normalizeMedicine);
  },

  updateMedicineStock: async (id, reduceBy) => {
    const response = await api.patch(`/medicines/${id}/stock`, { reduce_by: reduceBy });
    return response.data;
  },

  getPrescriptions: async () => {
    const data = await getData(api.get('/prescriptions'));
    return ensureArray(data).map(normalizePrescription);
  },

  savePrescription: async (prescription) => {
    const created = await getData(api.post('/prescriptions', prescriptionPayload(prescription)));
    const prescriptionId = created?.id ?? created?.pres_id ?? created?.prescription_id;

    if (prescriptionId && Array.isArray(prescription.medicines)) {
      await Promise.all(
        prescription.medicines.map((medicine) =>
          api.post(`/prescriptions/${prescriptionId}/medicines`, {
            medicine_id: Number(medicine.medicineId),
            quantity: Number(medicine.quantity),
            duration: medicine.duration,
            frequency: medicine.frequency,
          }),
        ),
      );
    }

    return created;
  },

  markMedicinePurchased: async (presId, medicineId) => {
    const response = await api.patch(`/prescriptions/${presId}/medicines/${medicineId}`, {
      purchased: true,
    });
    return response.data;
  },

  getLabTests: async () => {
    const data = await getData(api.get('/lab-tests'));
    return ensureArray(data).map(normalizeLabTest);
  },

  saveLabTest: async (test) => {
    const payload = {
      appointment_id: Number(test.appointmentId),
      test_name: test.testName,
      date: test.date,
      status: test.status,
    };

    const response = await api.post('/lab-tests/order', payload);
    return response.data;
  },

  updateLabResult: async (id, result, labTechId) => {
    const response = await api.post('/lab-tests/result', {
      order_id: id,
      result,
      lab_tech_id: labTechId,
    });
    return response.data;
  },

  updateLabStatus: async (id, status, labTechId) => {
    const response = await api.patch(`/lab-tests/${id}`, {
      status,
      lab_tech_id: labTechId,
    });
    return response.data;
  },

  getReferrals: async () => {
    const data = await getData(api.get('/referrals'));
    return ensureArray(data).map(normalizeReferral);
  },

  saveReferral: async (referral) =>
    createOrUpdate('referrals', referral.id, {
      patient_id: Number(referral.patientId),
      referred_to: referral.referredTo,
      reason: referral.reason,
      date: referral.date,
      nurse_id: referral.nurseId,
    }),

  getBeds: async () => {
    const data = await getData(api.get('/wards'));
    return ensureArray(data).map(normalizeBed);
  },

  getAdmissions: async () => {
    const data = await getData(api.get('/admissions'));
    return ensureArray(data).map(normalizeAdmission);
  },

  saveAdmission: async (admission) =>
    createOrUpdate('admissions', admission.id, {
      patient_id: Number(admission.patientId),
      bed_id: admission.bedId,
      ward_type: admission.wardType,
      bed_number: admission.bedNumber,
      status: admission.status,
      admit_date: admission.dateAdmitted,
      discharge_date: admission.dateDischarged,
      total_cost: Number(admission.totalCost ?? 0),
    }),

  dischargePatient: async (id, dischargeDate) => {
    const response = await api.patch(`/admissions/${id}/discharge`, {
      discharge_date: dischargeDate,
    });
    return response.data;
  },

  getStaff: async () => {
    const data = await getData(api.get('/staff'));
    return ensureArray(data).map(normalizeStaff);
  },

  saveStaff: async (staff) =>
    createOrUpdate('staff', staff.id, {
      name: staff.name,
      role: staff.role,
      email: staff.email,
      phone: staff.phone,
    }),

  removeStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
};
