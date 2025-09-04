// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';
import Home from './components/Home';
import ClientRegistration from './components/ClientRegistration';
import ClientDashboard from './components/ClientDashboard';
import ComplaintSubmission from './components/ComplaintSubmission';
import GroupHeadLogin from './components/GroupHeadLogin';
import GroupHeadDashboard from './components/GroupHeadDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import UserManagement from './components/UserManagement'; // ← Add this

// ✅ Updated: Show AdminHeader for both /admin and /group-head routes
function HeaderSelector({ registrationData, setRegistrationData }) {
  const location = useLocation();
  const isProtectedRoute = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/group-head');

  return isProtectedRoute ? (
    <AdminHeader />
  ) : (
    <Header registrationData={registrationData} setRegistrationData={setRegistrationData} />
  );
}

function App() {
  const [registrationData, setRegistrationData] = useState(null);
  const [groupHeadData, setGroupHeadData] = useState(null);

  return (
    <Router>
      <div>
        <HeaderSelector registrationData={registrationData} setRegistrationData={setRegistrationData} />
        <main>
          <Routes>
            <Route path="/" element={<Home setRegistrationData={setRegistrationData} />} />
            <Route path="/register" element={<ClientRegistration setRegistrationData={setRegistrationData} />} />
            <Route
              path="/complaint"
              element={
                <ComplaintSubmission
                  registrationData={registrationData}
                  setRegistrationData={setRegistrationData}
                />
              }
            />
            <Route path="/dashboard" element={<ClientDashboard registrationData={registrationData} />} />
            <Route path="/group-head-login" element={<GroupHeadLogin setGroupHeadData={setGroupHeadData} />} />
            <Route path="/group-head-dashboard" element={<GroupHeadDashboard groupHeadData={groupHeadData} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;