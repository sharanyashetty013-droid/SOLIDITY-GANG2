export function PrismIcon({ className = '', animate = false }) {
   const d = (s) => (animate ? { style: { animationDelay: parseFloat(s) * 0.5 + 's' } } : {})
  return (
    <svg className={'prism ' + (animate ? 'anim ' : '') + className} viewBox="80 200 600 340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9be8b0" />
          <stop offset="1" stopColor="#2fb85a" />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round" strokeLinecap="round">
        <path className="part" {...d('0.2s')} d="M265 256 L321 215 L536 215 L480 256 Z" fill="#e6f9ec" stroke="#111" strokeWidth="4" />
        <path className="part" {...d('0.6s')} d="M265 256 L480 256 L376 530 Z" fill="url(#gf)" stroke="#111" strokeWidth="4" />
        <path className="part" {...d('1s')} d="M480 256 L536 215 L435 490 L376 530 Z" fill="#7c5cf0" stroke="#111" strokeWidth="4" />
        <path className="part" {...d('1.2s')} d="M290 275 L310 275 L380 475 L362 478 Z" fill="#fff" opacity=".45" />
        <path className="part" {...d('1.3s')} d="M361 381 L361 408 Q361 420 375 420 L395 420 L395 402" fill="none" stroke="#111" strokeWidth="5" />
        <circle className="part" {...d('1.3s')} cx="361" cy="372" r="9" fill="#fff" stroke="#111" strokeWidth="4" />
        <circle className="part" {...d('1.3s')} cx="395" cy="393" r="9" fill="#fff" stroke="#111" strokeWidth="4" />
        <path className="ray" {...d('1.6s')} pathLength="1" d="M100 356 L305 356" stroke="#111" strokeWidth="6" fill="none" />
        <path className="ray" {...d('1.9s')} pathLength="1" d="M305 356 L480 356" stroke="#fff" strokeWidth="6" fill="none" />
        <path className="ray" {...d('2.1s')} pathLength="1" d="M480 356 L660 269" stroke="#22b455" strokeWidth="6" fill="none" />
        <path className="ray" {...d('2.1s')} pathLength="1" d="M480 356 L660 356" stroke="#8b4cf0" strokeWidth="6" fill="none" />
        <path className="ray" {...d('2.1s')} pathLength="1" d="M480 356 L660 444" stroke="#e0399b" strokeWidth="6" fill="none" />
        <circle className="dot" {...d('1.6s')} cx="100" cy="356" r="10" fill="#111" />
        <circle className="dot" {...d('2.6s')} cx="660" cy="269" r="10" fill="#22b455" />
        <circle className="dot" {...d('2.6s')} cx="660" cy="356" r="10" fill="#8b4cf0" />
        <circle className="dot" {...d('2.6s')} cx="660" cy="444" r="10" fill="#e0399b" />
      </g>
    </svg>
  )
}

export function Logo() {
  return (
    <div className="logo-sm">
      <PrismIcon />
      <span className="wordmark">PRism</span>
    </div>
  )
}