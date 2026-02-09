import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ToeicPlatform from './components/ToeicPlatform';
import MobileWordReview from './pages/MobileWordReview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ToeicPlatform />} />
      <Route path="/review" element={<MobileWordReview />} />
    </Routes>
  );
}

export default App;
