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

const extractTime = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    return value.split("T")[1]?.slice(0, 5) || "";
  }
  return "";
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
    return "";
  };

  const name = getString("name", "patient_name");
  if (!name) {
    return null;
  }

  return {
    id: normalizedRaw.patient_id ?? normalizedRaw.id ?? normalizedRaw.patientid,
    patient_id:
      normalizedRaw.patient_id ?? normalizedRaw.id ?? normalizedRaw.patientid,
    name,
    phone: getString("phone", "contact_number"),
    gender: getString("gender"),
    dob: getString("dob", "date_of_birth"),
    blood_group: getString("blood_group", "bloodGroup"),
    address: getString("address"),
    type: getString("type", "patient_type"),
    age: normalizedRaw.age ?? calculateAge(getString("dob", "date_of_birth")),
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
    return "";
  };

  const name = getString("name", "doctor_name");
  if (!name) {
    return null;
  }

  return {
    id: normalizedRaw.doctor_id ?? normalizedRaw.id ?? normalizedRaw.doctorid,
    doctor_id:
      normalizedRaw.doctor_id ?? normalizedRaw.id ?? normalizedRaw.doctorid,
    name,
    specialization: getString(
      "specialization",
      "specialization_name",
      "department",
    ),
    qualification: getString("qualification"),
    license_no: getString("license_no", "licenseNo", "licence_no"),
    dept_id: normalizedRaw.dept_id ?? normalizedRaw.deptid ?? "",
    email: getString("email"),
    consultation_fee: Number(
      normalizedRaw.consultation_fee ?? normalizedRaw.fee ?? 0,
    ),
  };
};

const normalizeAppointment = (raw) => {
  if (!raw) return null;

  const normalizedRaw = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  const dateTime = splitDateTime(
    normalizedRaw.appt_date ??
      normalizedRaw.date_time ??
      normalizedRaw.datetime ??
      normalizedRaw.date,
  );

  return {
    id:
      normalizedRaw.appt_id ??
      normalizedRaw.id ??
      normalizedRaw.app_id ??
      normalizedRaw.appointment_id,
    patientId: normalizedRaw.patient_id ?? normalizedRaw.patientid,
    doctorId: normalizedRaw.doctor_id ?? normalizedRaw.doctorid,
    date: dateTime.date,
    time: extractTime(normalizedRaw.appt_time) || dateTime.time,
    duration: Number(
      normalizedRaw.duration_mins ?? normalizedRaw.duration ?? 30,
    ),
    reason: normalizedRaw.reason ?? normalizedRaw.notes ?? "",
    height: normalizedRaw.height ?? "",
    weight: normalizedRaw.weight ?? "",
    status: normalizedRaw.status ?? "Scheduled",
    is_followup: Boolean(
      normalizedRaw.is_followup ??
      normalizedRaw.isfollowup ??
      normalizedRaw.notes === "Follow-up",
    ),
    is_referral: Boolean(normalizedRaw.is_referral ?? false),
    fee: Number(normalizedRaw.consultation_fee ?? normalizedRaw.fee ?? 0),
    parentAppointmentId:
      normalizedRaw.parent_appointment_id ??
      normalizedRaw.parentappointmentid ??
      "",
  };
};

const normalizeMedicine = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    id: normalizedRaw.id ?? normalizedRaw.med_id ?? normalizedRaw.medicine_id,
    med_id:
      normalizedRaw.med_id ?? normalizedRaw.id ?? normalizedRaw.medicine_id,
    medicine_id:
      normalizedRaw.medicine_id ?? normalizedRaw.id ?? normalizedRaw.med_id,
    name: normalizedRaw.name ?? normalizedRaw.medicine_name ?? "",
    stock: Number(normalizedRaw.stock ?? normalizedRaw.quantity_in_stock ?? 0),
    price: Number(normalizedRaw.price ?? 0),
    category: normalizedRaw.category ?? "",
  };
};

const normalizePrescriptionMedicine = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    medicineId:
      normalizedRaw.medicineid ??
      normalizedRaw.medicine_id ??
      normalizedRaw.med_id,
    medicine_id:
      normalizedRaw.medicine_id ??
      normalizedRaw.medicineid ??
      normalizedRaw.med_id,
    med_id:
      normalizedRaw.med_id ??
      normalizedRaw.medicine_id ??
      normalizedRaw.medicineid,
    medicineName:
      normalizedRaw.medicinename ?? normalizedRaw.medicine_name ?? "",
    quantity: Number(normalizedRaw.quantity ?? 1),
    dosage: normalizedRaw.dosage ?? "",
    duration: normalizedRaw.duration ?? "",
    frequency: normalizedRaw.frequency ?? normalizedRaw.dosage ?? "",
    purchased: Boolean(normalizedRaw.purchased ?? false),
  };
};

const normalizePrescription = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    id:
      normalizedRaw.id ??
      normalizedRaw.pres_id ??
      normalizedRaw.prescription_id,
    appointmentId:
      normalizedRaw.appointmentid ??
      normalizedRaw.appt_id ??
      normalizedRaw.app_id ??
      normalizedRaw.appointment_id,
    patientId: normalizedRaw.patientid ?? normalizedRaw.patient_id ?? "",
    patientName: normalizedRaw.patientname ?? normalizedRaw.patient_name ?? "",
    doctorId: normalizedRaw.doctorid ?? normalizedRaw.doctor_id ?? "",
    doctorName: normalizedRaw.doctorname ?? normalizedRaw.doctor_name ?? "",
    date:
      normalizedRaw.date ??
      normalizedRaw.presc_date ??
      normalizedRaw.created_at ??
      "",
    medicines: ensureArray(normalizedRaw.medicines).map(
      normalizePrescriptionMedicine,
    ),
  };
};

const normalizeLabTest = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    id: normalizedRaw.id ?? normalizedRaw.order_id ?? normalizedRaw.test_id,
    appointmentId:
      normalizedRaw.appointmentid ??
      normalizedRaw.app_id ??
      normalizedRaw.appt_id ??
      normalizedRaw.appointment_id ??
      "",
    patientId: normalizedRaw.patientid ?? normalizedRaw.patient_id ?? "",
    patientName: normalizedRaw.patientname ?? normalizedRaw.patient_name ?? "",
    doctorId: normalizedRaw.doctorid ?? normalizedRaw.doctor_id ?? "",
    doctorName: normalizedRaw.doctorname ?? normalizedRaw.doctor_name ?? "",
    testName:
      normalizedRaw.testname ??
      normalizedRaw.test_name ??
      normalizedRaw.name ??
      "",
    status: normalizedRaw.status ?? "Pending",
    result:
      typeof normalizedRaw.result === "object"
        ? (normalizedRaw.result?.result ?? "")
        : (normalizedRaw.result ?? ""),
    remarks:
      typeof normalizedRaw.result === "object"
        ? (normalizedRaw.result?.remarks ?? "")
        : (normalizedRaw.remarks ?? ""),
    date:
      normalizedRaw.date ??
      normalizedRaw.test_date ??
      normalizedRaw.created_at ??
      "",
  };
};

const normalizeReferral = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    id: normalizedRaw.id ?? normalizedRaw.referral_id,
    patientId: normalizedRaw.patientid ?? normalizedRaw.patient_id,
    referredTo:
      normalizedRaw.referredto ??
      normalizedRaw.referred_to ??
      normalizedRaw.to_doctor_name ??
      normalizedRaw.to_department ??
      normalizedRaw.destination ??
      "",
    reason: normalizedRaw.reason ?? normalizedRaw.notes ?? "",
    date:
      normalizedRaw.date ??
      normalizedRaw.referral_date ??
      normalizedRaw.created_at ??
      "",
    nurseId: normalizedRaw.nurseid ?? normalizedRaw.nurse_id ?? "",
  };
};

const normalizeBed = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  const readBoolean = (value, fallback = false) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const normalized = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;

    return fallback;
  };

  return {
    id: normalizedRaw.id ?? normalizedRaw.bed_id,
    bed_id: normalizedRaw.bed_id ?? normalizedRaw.id,
    wardId: normalizedRaw.ward_id ?? normalizedRaw.wardid ?? "",
    wardName: normalizedRaw.ward_name ?? "",
    wardType: normalizedRaw.ward_type ?? normalizedRaw.ward ?? "",
    bedNumber: normalizedRaw.bed_number ?? normalizedRaw.bed_no ?? "",
    isAvailable: readBoolean(
      normalizedRaw.is_available ?? normalizedRaw.isavailable,
    ),
    costPerDay: Number(
      normalizedRaw.cost_per_day ?? normalizedRaw.costperday ?? 0,
    ),
    totalBeds: Number(normalizedRaw.total_beds ?? 0),
    occupiedBeds: Number(normalizedRaw.occupied_beds ?? 0),
    availableBeds: Number(normalizedRaw.available_beds ?? 0),
  };
};

const expandWardBeds = (wards, admissions = []) => {
  const activeAdmissions = admissions
    .map(normalizeAdmission)
    .filter((admission) => admission && admission.status === "Admitted");

  return wards.flatMap((rawWard) => {
    const ward = Object.entries(rawWard || {}).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});

    const wardId = ward.ward_id ?? ward.wardid ?? ward.id;
    const wardType =
      ward.ward_type ?? ward.ward ?? ward.ward_name ?? `Ward ${wardId}`;
    const wardName = ward.ward_name ?? wardType;
    const totalBeds = Number(ward.total_beds ?? ward.totalbeds ?? 0);
    const costPerDay = Number(ward.costperday ?? ward.cost_per_day ?? 0);
    const occupiedBedNumbers = new Set(
      activeAdmissions
        .filter((admission) => admission.wardType === wardType)
        .map((admission) => String(admission.bedNumber)),
    );

    return Array.from({ length: totalBeds }, (_, index) => {
      const bedNumber = String(index + 1);
      const occupiedBeds = occupiedBedNumbers.size;

      return {
        id: Number(wardId) * 10000 + index + 1,
        bed_id: Number(wardId) * 10000 + index + 1,
        wardId,
        wardName,
        wardType,
        bedNumber,
        isAvailable: !occupiedBedNumbers.has(bedNumber),
        costPerDay,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(totalBeds - occupiedBeds, 0),
      };
    });
  });
};

const normalizeAdmission = (raw) => {
  const normalizedRaw = Object.entries(raw || {}).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  return {
    id: normalizedRaw.id ?? normalizedRaw.admission_id,
    patientId: normalizedRaw.patientid ?? normalizedRaw.patient_id,
    bedId: normalizedRaw.bedid ?? normalizedRaw.bed_id,
    wardType: normalizedRaw.wardtype ?? normalizedRaw.ward_type ?? "",
    bedNumber: normalizedRaw.bednumber ?? normalizedRaw.bed_number ?? "",
    status: normalizedRaw.status ?? "Admitted",
    dateAdmitted:
      normalizedRaw.dateadmitted ??
      normalizedRaw.admission_date ??
      normalizedRaw.admit_date ??
      normalizedRaw.admitted_at ??
      "",
    dateDischarged:
      normalizedRaw.datedischarged ??
      normalizedRaw.discharge_date ??
      normalizedRaw.discharged_at ??
      null,
    totalCost: Number(normalizedRaw.totalcost ?? normalizedRaw.total_cost ?? 0),
  };
};

const normalizeStaff = (raw) => {
  if (!raw) return null;

  const normalizedRaw = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  return {
    id: normalizedRaw.id ?? normalizedRaw.staff_id ?? normalizedRaw.staffid,
    staff_id:
      normalizedRaw.staff_id ?? normalizedRaw.id ?? normalizedRaw.staffid,
    name: normalizedRaw.name ?? "",
    role: normalizedRaw.role ?? "",
    email: normalizedRaw.email ?? "",
    phone: normalizedRaw.phone ?? "",
  };
};

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
    throw new Error("Doctor name is required");
  }
  if (!data.specialization || !data.specialization.trim()) {
    throw new Error("Specialization is required");
  }

  return {
    name: data.name.trim(),
    specialization: data.specialization.trim(),
    qualification: data.qualification?.trim() || null,
    license_no: data.license_no?.trim() || null,
    dept_id: data.dept_id ? Number(data.dept_id) : null,
    email: data.email?.trim() || null,
    consultation_fee: data.consultation_fee
      ? Number(data.consultation_fee)
      : null,
  };
};

const appointmentPayload = (data) => ({
  patient_id: Number(data.patientId),
  doctor_id: Number(data.doctorId),
  appt_date: formatDateTime(data.date, data.time),
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
  appt_id: Number(data.appointmentId),
  medicines: (data.medicines || []).map((med) => ({
    medicine_id: Number(med.medicineId),
    dosage:
      med.dosage || med.duration || (med.quantity ? `Qty ${med.quantity}` : ""),
    frequency: med.frequency || "",
  })),
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
    const data = await getData(api.get("/patients"));
    return ensureArray(data)
      .map(normalizePatient)
      .filter((patient) => patient !== null && patient.name);
  },

  savePatient: async (patient) =>
    createOrUpdate("patients", patient.id, patientPayload(patient)),

  removePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  getDoctors: async () => {
    const data = await getData(api.get("/doctors"));
    return ensureArray(data)
      .map(normalizeDoctor)
      .filter((doctor) => doctor !== null && doctor.name);
  },

  saveDoctor: async (doctor) =>
    createOrUpdate("doctors", doctor.id, doctorPayload(doctor)),

  removeDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  getAppointments: async () => {
    const data = await getData(api.get("/appointments"));
    return ensureArray(data).map(normalizeAppointment);
  },

  getAvailableAppointments: async () => {
    try {
      const data = await getData(
        api.get("/prescriptions/appointments/available"),
      );
      return ensureArray(data).map(normalizeAppointment);
    } catch (error) {
      if (error.response?.status === 404) {
        const fallback = await getData(api.get("/appointments"));
        return ensureArray(fallback).map(normalizeAppointment);
      }
      throw error;
    }
  },

  saveAppointment: async (appointment) =>
    createOrUpdate(
      "appointments",
      appointment.id,
      appointmentPayload(appointment),
    ),

  getMedicines: async () => {
    const data = await getData(api.get("/medicines"));
    return ensureArray(data).map(normalizeMedicine);
  },

  updateMedicineStock: async (id, reduceBy) => {
    const response = await api.patch(`/medicines/${id}/stock`, {
      reduce_by: reduceBy,
    });
    return response.data;
  },

  addMedicineStock: async (id, addBy) => {
    const response = await api.patch(`/medicines/${id}/stock`, {
      add_by: addBy,
    });
    return response.data;
  },

  getPrescriptions: async () => {
    const data = await getData(api.get("/prescriptions"));
    return ensureArray(data).map(normalizePrescription);
  },

  savePrescription: async (prescription) => {
    const payload = prescriptionPayload(prescription);
    console.log("📋 Prescription payload being sent to API:", payload);
    return getData(api.post("/prescriptions", payload));
  },

  removePrescription: async (id) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  },

  markMedicinePurchased: async (presId, medicineId) => {
    const response = await api.patch(
      `/prescriptions/${presId}/medicines/${medicineId}`,
      {
        purchased: true,
      },
    );
    return {
      success: true,
      message: response.data?.message || "Medicine marked as purchased",
      ...response.data,
    };
  },

  getLabTests: async () => {
    const data = await getData(api.get("/lab-tests"));
    return ensureArray(data).map(normalizeLabTest);
  },

  saveLabTest: async (test) => {
    const payload = {
      appointment_id: Number(test.appointmentId),
      test_name: test.testName,
      date: test.date,
      status: test.status,
    };

    const response = await api.post("/lab-tests/order", payload);
    return response.data;
  },

  updateLabResult: async (id, result, labTechId) => {
    const response = await api.post("/lab-tests/result", {
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
    const data = await getData(api.get("/referrals"));
    return ensureArray(data).map(normalizeReferral);
  },

  saveReferral: async (referral) =>
    createOrUpdate("referrals", referral.id, {
      patient_id: Number(referral.patientId),
      referred_to: referral.referredTo,
      reason: referral.reason,
      date: referral.date,
      nurse_id: referral.nurseId,
    }),

  getBeds: async () => {
    const data = await getData(api.get("/wards"));
    const rows = ensureArray(data);
    const hasVirtualBeds = rows.some((row) => {
      const keys = Object.keys(row || {}).map((key) => key.toLowerCase());
      return (
        keys.includes("bed_number") ||
        keys.includes("bed_id") ||
        keys.includes("is_available")
      );
    });

    if (hasVirtualBeds) {
      return rows.map(normalizeBed);
    }

    const admissions = await getData(api.get("/admissions"));
    return expandWardBeds(rows, ensureArray(admissions));
  },

  getAdmissions: async () => {
    const data = await getData(api.get("/admissions"));
    return ensureArray(data).map(normalizeAdmission);
  },

  saveAdmission: async (admission) =>
    createOrUpdate("admissions", admission.id, {
      patient_id: Number(admission.patientId),
      bed_id: admission.bedId,
      ward_type: admission.wardType,
      bed_number: admission.bedNumber,
      status: admission.status,
      admit_date: admission.dateAdmitted,
      discharge_date: admission.dateDischarged,
      total_cost: Number(admission.totalCost ?? 0),
    }),

  increaseWardCapacity: async (wardId, addBeds) => {
    const response = await api.patch(`/wards/${wardId}/capacity`, {
      add_beds: Number(addBeds),
    });
    return response.data;
  },

  dischargePatient: async (id, dischargeDate) => {
    const response = await api.patch(`/admissions/${id}/discharge`, {
      discharge_date: dischargeDate,
    });
    return response.data;
  },

  getStaff: async () => {
    const data = await getData(api.get("/staff"));
    return ensureArray(data)
      .map(normalizeStaff)
      .filter((staff) => staff !== null && staff.name);
  },

  saveStaff: async (staff) =>
    createOrUpdate("staff", staff.id, {
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
