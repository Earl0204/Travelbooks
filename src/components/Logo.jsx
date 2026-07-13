
export default function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sunny Orange Circle Background */}
      <circle cx="50" cy="50" r="45" fill="#ffa200" />
      
      {/* Deep Navy Suitcase Body */}
      {/* Top handle */}
      <path
        d="M38,32 C38,28 42,26 50,26 C58,26 62,28 62,32"
        fill="none"
        stroke="#032757"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Suitcase main body */}
      <rect x="25" y="32" width="50" height="38" rx="8" fill="#032757" />
      {/* Suitcase feet */}
      <rect x="32" y="70" width="6" height="4" rx="1" fill="#032757" />
      <rect x="62" y="70" width="6" height="4" rx="1" fill="#032757" />
      
      {/* Stylized White TB Ligature */}
      <g fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* T & B shared spine */}
        <path d="M42,41 L42,63" />
        {/* Top T-bar */}
        <path d="M34,41 L47,41" />
        {/* B loops */}
        <path d="M42,41 C51,41 51,50 42,50 C53,50 53,63 42,63" />
      </g>
    </svg>
  );
}
