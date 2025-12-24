export function SafiLogo() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="w-10 h-10 sm:w-12 sm:h-12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="safiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(210 100% 40%)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(200 100% 45%)", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Simple stylized S */}
      <path
        d="M 30 10 Q 30 8 28 8 L 12 8 Q 10 8 10 10 Q 10 12 12 13 L 28 13 Q 30 13 30 15 Q 30 17 28 18 L 12 18 Q 10 18 10 20 L 10 20 Q 10 22 12 23 L 28 23 Q 30 23 30 25 Q 30 27 28 28 L 12 28 Q 10 28 10 30 Q 10 32 12 32 L 28 32 Q 30 32 30 30"
        stroke="url(#safiGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
