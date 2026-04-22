export const ROLES = {
  ADMIN: 'Admin',
  RECEPTIONIST: 'Receptionist',
  NURSE: 'Nurse',
  LAB_TECH: 'Lab Technician',
  PHARMACIST: 'Pharmacist'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['/dashboard', '/staff', '/doctors', '/admissions', '/medicines', '/patients'], // Admin can manage staff, doctors, wards (via admissions), medicine inventory, and view patients
  [ROLES.RECEPTIONIST]: ['/dashboard', '/patients', '/appointments', '/admissions', '/doctors'],
  [ROLES.NURSE]: ['/dashboard', '/patients', '/appointments', '/admissions', '/doctors', '/patient-history', '/prescriptions', '/lab-tests', '/referrals'],
  [ROLES.LAB_TECH]: ['/dashboard', '/lab-tests'],
  [ROLES.PHARMACIST]: ['/dashboard', '/medicines', '/prescriptions']
};

export const hasAccess = (role, path) => {
  if (!role) return false;
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(path);
};