import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ToeicPlatform from './components/ToeicPlatform';
import MobileWordReview from './pages/MobileWordReview';
import MiniQuizPage from './pages/MiniQuizPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ToeicPlatform />} />
      <Route path="/review" element={<MobileWordReview />} />
      <Route path="/mini-quiz" element={<MiniQuizPage />} />
    </Routes>
  );
}

export default App;
