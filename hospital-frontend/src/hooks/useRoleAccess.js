import { useAuth } from '../context/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();
  
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = hasRole('Admin');
  const isReceptionist = hasRole('Receptionist');
  const isNurse = hasRole('Nurse');
  const isLabTech = hasRole('Lab Technician');
  const isPharmacist = hasRole('Pharmacist');

  return {
    user,
    hasRole,
    isAdmin,
    isReceptionist,
    isNurse,
    isLabTech,
    isPharmacist
  };
};
