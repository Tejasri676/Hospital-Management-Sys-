import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import LabTests from "./pages/LabTests";
import Medicines from "./pages/Medicines";
import Admissions from "./pages/Admissions";
import Referrals from "./pages/Referrals";
import Staff from "./pages/Staff";
import PatientHistory from "./pages/PatientHistory";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/patient-history" element={<PatientHistory />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/lab-tests" element={<LabTests />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/staff" element={<Staff />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


