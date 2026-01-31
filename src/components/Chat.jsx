import { useState, useRef, useEffect } from 'react';

export default function Chat({ messages, onSendMessage, identity }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Messages */}
        <div className="mb-4 space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {messages.map((msg, idx) => (
            <Message 
              key={msg.id} 
              message={msg} 
              isOwn={msg.userId === identity.username}
              index={idx}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            aria-label="Chat message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? '' : 'type to speak...'}
            className="w-full frost-input border rounded-lg px-4 py-3 
                     text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600
                     transition-all cursor-text text-sm backdrop-blur-sm"
            maxLength={200}
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs transition-all 
                       ${input.trim() ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
          >
            send
          </button>
        </form>
      </div>
    </div>
  );
}

function Message({ message, isOwn, index }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    const timer = setTimeout(() => setOpacity(1), 50);
    
    // Start fading out after 60 seconds
    const fadeTimer = setTimeout(() => {
      setOpacity(0.3);
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div
      className="flex items-start gap-2 transition-opacity duration-1000"
      style={{ 
        opacity,
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: message.color }}
        dangerouslySetInnerHTML={{ __html: message.avatar }}
      />

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span 
            className="text-xs font-mono"
            style={{ color: message.color }}
          >
            {message.username}
          </span>
          {isOwn && (
            <span className="text-zinc-700 text-xs">you</span>
          )}
        </div>
        <p className="text-white text-sm leading-relaxed break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}