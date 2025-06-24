import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';

// App component
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
