import { Database } from 'lucide-react';

export function SpatialMapProjectCover() {
  return (
    <div className="relative w-full h-52 sm:h-56 rounded-xl overflow-hidden border border-line bg-[#0F2C4C] select-none">
      <svg viewBox="0 0 400 240" className="w-full h-full object-cover" preserveAspectRatio="none">
        <rect width="400" height="240" fill="#12395B" />
        <path d="M0 40 Q70 25 130 55 T230 95 Q250 130 210 175 L0 215 Z" fill="#2A623D" opacity="0.9" />
        <path d="M275 15 Q330 45 355 95 T310 190 L400 220 L400 0 Z" fill="#235334" opacity="0.85" />
        <path d="M30 85 Q95 75 150 115 T175 180 L40 205 Z" fill="#397A4C" opacity="0.65" />
        <g stroke="#7CC490" strokeWidth="0.7" opacity="0.45" fill="none">
          <polyline points="20,90 85,75 135,105 110,160 45,155 20,90" />
          <polyline points="85,75 160,65 195,115 135,105" />
          <polyline points="295,60 350,80 340,145 285,125 295,60" />
          <line x1="135" y1="105" x2="285" y2="125" strokeDasharray="3 3" stroke="#93C5FD" />
        </g>
        <circle cx="95" cy="110" r="24" fill="#FEA402" opacity="0.22" />
        <circle cx="155" cy="125" r="32" fill="#EF4444" opacity="0.2" />
        <circle cx="315" cy="105" r="22" fill="#38BDF8" opacity="0.22" />
        {[[65, 95],[95, 110],[135, 105],[155, 125],[115, 148],[185, 140],[305, 95],[328, 122]].map(([cx, cy], idx) => (
          <g key={idx}>
            <circle cx={cx} cy={cy} r="5" fill="#38BDF8" opacity="0.35" />
            <circle cx={cx} cy={cy} r="2.5" fill="#E0F2FE" />
          </g>
        ))}
      </svg>
      <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-navy/95 border border-white/15 flex items-center justify-center text-sky-300">
        <Database className="w-5 h-5" />
      </div>
    </div>
  );
}
