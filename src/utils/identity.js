// Username generation
const adjectives = [
  'quiet', 'lost', 'neon', 'ghost', 'silver', 'cosmic', 'faded', 'bright',
  'hollow', 'gentle', 'swift', 'ancient', 'wild', 'calm', 'electric', 'shadow',
  'velvet', 'crystal', 'ember', 'lunar', 'stellar', 'vapor', 'iron', 'silk',
  'frozen', 'burning', 'distant', 'tender', 'fierce', 'dreaming'
];

const nouns = [
  'otter', 'fox', 'raven', 'wolf', 'deer', 'owl', 'bear', 'lynx',
  'hawk', 'swan', 'byte', 'pixel', 'cipher', 'spark', 'echo', 'void',
  'prism', 'pulse', 'wave', 'flame', 'frost', 'storm', 'cloud', 'star',
  'moon', 'comet', 'nova', 'drift', 'whisper', 'signal'
];

export function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
}

// Procedural SVG avatar generation
export function generateAvatar() {
  const seed = Math.random();
  const hue = Math.floor(seed * 360);
  const pattern = Math.floor(seed * 4);

  // Simple geometric patterns
  const patterns = [
    // Circles
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="hsl(${hue}, 60%, 50%)" opacity="0.3"/>
      <circle cx="12" cy="12" r="6" fill="hsl(${hue}, 70%, 60%)" opacity="0.6"/>
      <circle cx="12" cy="12" r="3" fill="hsl(${hue}, 80%, 70%)"/>
    </svg>`,
    
    // Triangles
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,4 20,20 4,20" fill="hsl(${hue}, 60%, 50%)" opacity="0.3"/>
      <polygon points="12,8 17,18 7,18" fill="hsl(${hue}, 70%, 60%)" opacity="0.6"/>
      <polygon points="12,12 14,16 10,16" fill="hsl(${hue}, 80%, 70%)"/>
    </svg>`,
    
    // Squares
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" fill="hsl(${hue}, 60%, 50%)" opacity="0.3"/>
      <rect x="6" y="6" width="12" height="12" fill="hsl(${hue}, 70%, 60%)" opacity="0.6"/>
      <rect x="9" y="9" width="6" height="6" fill="hsl(${hue}, 80%, 70%)"/>
    </svg>`,
    
    // Diamonds
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 22,12 12,22 2,12" fill="hsl(${hue}, 60%, 50%)" opacity="0.3"/>
      <polygon points="12,6 18,12 12,18 6,12" fill="hsl(${hue}, 70%, 60%)" opacity="0.6"/>
      <polygon points="12,9 15,12 12,15 9,12" fill="hsl(${hue}, 80%, 70%)"/>
    </svg>`
  ];

  return patterns[pattern];
}