import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Cursor from './Cursor';
import Chat from './Chat';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

export default function Room({ roomId, identity, onLeave }) {
  const [socket, setSocket] = useState(null);
  const [cursors, setCursors] = useState({});
  const [messages, setMessages] = useState([]);
  const containerRef = useRef(null);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join room
    newSocket.emit('join_room', { roomId, identity });

    // Listen for cursor updates
    newSocket.on('cursor_update', ({ userId, x, y, username, color, avatar }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: { x, y, username, color, avatar }
      }));
    });

    // Listen for user leaving
    newSocket.on('user_left', ({ userId }) => {
      setCursors(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    // Listen for messages
    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Auto-fade messages after 90 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      }, 90000);
    });

    return () => newSocket.close();
  }, [roomId, identity]);

  const handleMouseMove = (e) => {
    if (!socket || !containerRef.current) return;
    
    const now = Date.now();
    // Throttle to 60fps
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    socket.emit('cursor_move', { roomId, x, y });
  };

  const handleSendMessage = (text) => {
    if (!socket) return;
    socket.emit('send_message', { roomId, text });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full relative bg-black cursor-default"
    >
      {/* Exit Button */}
      <button
        onClick={onLeave}
        className="absolute top-4 left-4 z-50 px-3 py-1.5 text-xs text-zinc-500 
                   hover:text-zinc-300 border border-zinc-800 rounded-md
                   hover:border-zinc-700 transition-all cursor-pointer btn-ghost"
      >
        ← lobby
      </button>

      {/* Room Info */}
      <div className="absolute top-4 right-4 z-50 text-right">
        <div className="text-zinc-600 text-xs font-mono mb-1">
          room {roomId.slice(0, 8)}
        </div>
        <div className="text-zinc-500 text-xs">
          {Object.keys(cursors).length + 1} present
        </div>
      </div>

      {/* Cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <Cursor
          key={userId}
          x={cursor.x}
          y={cursor.y}
          username={cursor.username}
          color={cursor.color}
          avatar={cursor.avatar}
        />
      ))}

      {/* Chat */}
      <Chat 
        messages={messages} 
        onSendMessage={handleSendMessage}
        identity={identity}
      />

      {/* Subtle Center Text (only shows when quiet) */}
      {messages.length === 0 && Object.keys(cursors).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-zinc-700 text-sm animate-pulse">
            move your cursor
          </div>
        </div>
      )}
    </div>
  );
}