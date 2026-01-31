import { useEffect, useRef, useState } from 'react';

export default function Cursor({ x, y, username, color, avatar }) {
  const cursorRef = useRef(null);
  const [displayPos, setDisplayPos] = useState({ x, y });
  const animationRef = useRef(null);
  const targetPos = useRef({ x, y });

  useEffect(() => {
    targetPos.current = { x, y };
  }, [x, y]);

  useEffect(() => {
    // Smooth interpolation for cursor movement
    const animate = () => {
      setDisplayPos(prev => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        
        // Lerp with easing
        return {
          x: prev.x + dx * 0.2,
          y: prev.y + dy * 0.2
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="absolute pointer-events-none transition-opacity duration-300 z-40"
      style={{
        left: `${displayPos.x}%`,
        top: `${displayPos.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Cursor Pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
      >
        <path
          d="M5.5 3.5L19 12L11.5 14.5L9 22L5.5 3.5Z"
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
      </svg>

      {/* Username Label */}
      <div
        className="absolute left-6 top-0 whitespace-nowrap text-xs font-mono px-2 py-1 
                   rounded shadow-lg animate-fade-in"
        style={{
          backgroundColor: color,
          color: 'black',
          opacity: 0.9
        }}
      >
        {username}
      </div>

      {/* Subtle Trail Effect */}
      <div
        className="absolute w-1 h-1 rounded-full animate-ping"
        style={{
          backgroundColor: color,
          left: '8px',
          top: '8px',
          animationDuration: '2s'
        }}
      />
    </div>
  );
}