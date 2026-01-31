import { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import Room from './components/Room';
import { generateUsername, generateAvatar } from './utils/identity';

function App() {
  const [currentView, setCurrentView] = useState('lobby');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    // Generate identity once on mount
    const storedIdentity = sessionStorage.getItem('identity');
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    } else {
      const newIdentity = {
        username: generateUsername(),
        avatar: generateAvatar(),
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
      setIdentity(newIdentity);
      sessionStorage.setItem('identity', JSON.stringify(newIdentity));
    }
  }, []);

  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    setCurrentView('room');
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setCurrentView('lobby');
  };

  if (!identity) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">materializing...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Background layer (keeps visual background behind UI) */}
      <div className="absolute inset-0 -z-10" aria-hidden />

      {/* Main UI content */}
      <div className="w-full h-full relative z-10">
        {currentView === 'lobby' ? (
          <Lobby onJoinRoom={joinRoom} identity={identity} />
        ) : (
          <Room roomId={currentRoom} identity={identity} onLeave={leaveRoom} />
        )}
      </div>
    </div>
  );
}

export default App;