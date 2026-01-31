import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

export default function Lobby({ onJoinRoom, identity }) {
  const [rooms, setRooms] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.debug('socket connected', newSocket.id, 'to', SOCKET_URL);
      newSocket.emit('get_rooms');
    });

    newSocket.on('rooms_update', (roomsList) => {
      setRooms(roomsList);
    });

    newSocket.on('connect_error', (err) => {
      console.error('socket connect_error', err);
    });

    return () => newSocket.close();
  }, []);

  const handleJoinRoom = (roomId) => {
    if (socket) {
      socket.close();
    }
    onJoinRoom(roomId);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-light text-white mb-2 tracking-wider">
          ghostrooms
        </h1>
        <p className="text-zinc-500 text-sm">
          no signup · no history · just here
        </p>
      </div>

      {/* Identity Display */}
      <div className="mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800">
        <div 
          className="w-6 h-6 rounded-full" 
          style={{ backgroundColor: identity.color }}
          dangerouslySetInnerHTML={{ __html: identity.avatar }}
        />
        <span className="text-zinc-400 text-sm font-mono">{identity.username}</span>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {rooms.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onJoin={() => handleJoinRoom(room.id)} 
          />
        ))}
        
        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-600 text-sm">
            waiting for rooms to materialize...
          </div>
        )}
      </div>

      {/* Subtle Instructions */}
      <div className="mt-12 text-zinc-700 text-xs text-center max-w-md">
        rooms spawn when needed · disappear when empty · refresh to become someone new
      </div>
    </div>
  );
}

function RoomCard({ room, onJoin }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onJoin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 
                 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300
                 cursor-pointer text-left"
    >
      {/* Activity Pulse */}
      {room.activity > 0.5 && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500/50 
                        animate-pulse" />
      )}

      {/* Room Info */}
      <div className="text-zinc-400 text-xs font-mono mb-2">
        room {room.id.slice(0, 8)}
      </div>
      
      {/* Occupancy */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-white text-2xl font-light">{room.occupants}</span>
        <span className="text-zinc-600 text-sm">
          {room.occupants === 1 ? 'soul' : 'souls'}
        </span>
      </div>

      {/* Activity Indicator */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-6 bg-zinc-800 rounded-full transition-all duration-300"
            style={{
              height: isHovered || i < Math.floor(room.activity * 5) 
                ? `${(i + 1) * 4 + 8}px` 
                : '8px',
              backgroundColor: isHovered || i < Math.floor(room.activity * 5)
                ? 'rgb(63, 63, 70)'
                : 'rgb(39, 39, 42)'
            }}
          />
        ))}
      </div>

      {/* Hover State */}
      <div className={`absolute inset-0 border-2 border-white/10 rounded-lg 
                      transition-opacity duration-300 pointer-events-none
                      ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
}