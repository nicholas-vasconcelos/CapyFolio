export function LlmEventCover() {
  return (
    <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden border border-line bg-[#0B2545] flex flex-col items-center justify-center select-none">
      <svg viewBox="0 0 400 220" className="w-full h-full" fill="none">
        <defs>
          <radialGradient id="llmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0B2545" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="220" fill="#0A223E" />
        <circle cx="200" cy="100" r="95" fill="url(#llmGlow)" />
        <g stroke="#38BDF8" strokeWidth="1.2" opacity="0.45">
          <path d="M40 65 H115 L135 80" />
          <path d="M30 100 H110" />
          <path d="M45 135 H115 L135 120" />
          <path d="M360 65 H285 L265 80" />
          <path d="M370 100 H290" />
          <path d="M355 135 H285 L265 120" />
          <path d="M170 25 V50" />
          <path d="M200 20 V45" />
          <path d="M230 25 V50" />
        </g>
        {[[40,65],[30,100],[45,135],[360,65],[370,100],[355,135],[170,25],[200,20],[230,25]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#7DD3FC" opacity="0.7" />
        ))}
        <rect x="142" y="46" width="116" height="104" rx="14" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
        <g stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M196 64 C180 60 166 70 166 84 C160 88 158 98 164 106 C160 116 168 128 180 128 C186 132 196 130 196 122 Z" fill="#0284C7" fillOpacity="0.25" />
          <path d="M176 82 C182 82 186 86 186 92" />
          <path d="M172 102 C180 100 185 104 188 110" />
          <path d="M204 64 C220 60 234 70 234 84 C240 88 242 98 236 106 C240 116 232 128 220 128 C214 132 204 130 204 122 Z" fill="#0284C7" fillOpacity="0.25" />
          <path d="M224 82 C218 82 214 86 214 92" />
          <path d="M228 102 C220 100 215 104 212 110" />
        </g>
        <text x="200" y="186" textAnchor="middle" fill="#E0F2FE" fontSize="24" fontWeight="700" letterSpacing="3" fontFamily="Inter, sans-serif">LLM</text>
      </svg>
    </div>
  );
}
