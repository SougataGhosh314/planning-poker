import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { RoomPage } from './components/RoomPage';
import { Footer } from './components/Footer';
import { DonationPopup } from './components/DonationPopup';
import { socket } from './socket';

function App() {
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('estimator');
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    // Check if user is already in a room (e.g. from URL params if we implemented that, 
    // or just session restore - but for now we keep it simple as requested)

    // Cleanup on unmount
    return () => {
      // socket.disconnect(); // Don't disconnect, just leave room logic handled in components
    };
  }, []);

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleJoin = (newRoomId, name, newRole) => {
    setRoomId(newRoomId);
    setUserName(name);
    setRole(newRole);
  };

  const handleLeave = () => {
    setRoomId(null);
    setUserName('');
    setRole('estimator');
    // Ideally emit a leave event or handle via disconnect
    window.location.reload(); // Simple way to reset socket state cleanly
  };

  return (
    <div className="app">
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1000,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-color)',
          padding: '8px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px var(--shadow-color)'
        }}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      {!roomId ? (
        <LandingPage onJoin={handleJoin} />
      ) : (
        <RoomPage
          roomId={roomId}
          userName={userName}
          role={role}
          onLeave={handleLeave}
        />
      )}

      <Footer onDonate={() => setShowDonation(true)} />
      {showDonation && <DonationPopup onClose={() => setShowDonation(false)} />}
    </div>
  );
}

export default App;
