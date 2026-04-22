import { getData } from '../utils/mockDatabase';

export const login = async (staff_id, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const staffList = getData('staff');
      const user = staffList.find(s => s.staff_id === staff_id && s.password === password);
      
      if (user) {
        // Exclude password from the returned object
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500); // simulate network delay
  });
};
