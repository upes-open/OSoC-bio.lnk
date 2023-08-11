import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// import Login from './Components/Login/Login';
// import Signup from './Components/Login/Signup';
// import Dashboard from './Components/Login/Dashboard';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import Footer from './Components/Footer/Footer';
import GoogleLoginButton from './Components/Login/GoogleLoginButton';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<GoogleLoginButton />} />
          {/* <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route index element={<Login />} /> */}
          {/* Add other routes or components as needed */}
          {/* <Route path="/profile" element={<UserProfile />} /> */}
          {/* <Route path="/settings" element={<UserSettings />} /> */}
        </Routes>
        <Navbar />
        <Hero />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
