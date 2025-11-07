import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'medium', animated = true, showText = true, className = '' }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizes = {
    small: { container: 'h-8', icon: 32, text: 'text-lg' },
    medium: { container: 'h-12', icon: 48, text: 'text-2xl' },
    large: { container: 'h-16', icon: 64, text: 'text-3xl' },
  };

  const currentSize = sizes[size];

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${currentSize.container} aspect-square`}>
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={mounted && animated ? 'animate-fadeIn' : ''}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <clipPath id="radarClip">
              <circle cx="50" cy="50" r="35" />
            </clipPath>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            className={animated ? 'animate-pulse-slow' : ''}
          />

          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
            className={animated && isHovered ? 'logo-pulse-fast' : ''}
          />

          {animated && (
            <g clipPath="url(#radarClip)">
              <line
                x1="50"
                y1="50"
                x2="85"
                y2="50"
                stroke="url(#glowGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className="logo-radar-sweep"
                style={{
                  transformOrigin: '50px 50px',
                }}
              />
            </g>
          )}

          <circle cx="25" cy="50" r="6" fill="url(#logoGradient)" className={animated ? 'logo-node-pulse' : ''}>
            <animate
              attributeName="r"
              values="6;7;6"
              dur="2s"
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>

          <circle cx="50" cy="30" r="6" fill="url(#logoGradient)" className={animated ? 'logo-node-pulse' : ''}>
            <animate
              attributeName="r"
              values="6;7;6"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          </circle>

          <circle cx="50" cy="70" r="6" fill="url(#logoGradient)" className={animated ? 'logo-node-pulse' : ''}>
            <animate
              attributeName="r"
              values="6;7;6"
              dur="2s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </circle>

          <circle cx="75" cy="50" r="8" fill="url(#logoGradient)" filter="url(#glow)">
            <animate
              attributeName="r"
              values="8;9;8"
              dur="2s"
              repeatCount="indefinite"
              begin="0.9s"
            />
          </circle>

          <path
            d="M 25 50 L 50 30"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          />
          <path
            d="M 50 30 L 75 50"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          />
          <path
            d="M 25 50 L 50 70"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          />
          <path
            d="M 50 70 L 75 50"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          />

          {animated && (
            <>
              <circle cx="25" cy="50" r="6" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0">
                <animate
                  attributeName="r"
                  values="6;12;18"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0.3;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="75" cy="50" r="8" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0">
                <animate
                  attributeName="r"
                  values="8;14;20"
                  dur="2s"
                  repeatCount="indefinite"
                  begin="0.5s"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.4;0"
                  dur="2s"
                  repeatCount="indefinite"
                  begin="0.5s"
                />
              </circle>
            </>
          )}

          <path
            d="M 70 50 L 73 47 L 76 50 L 73 53 Z"
            fill="#06b6d4"
            opacity="0.9"
          />
        </svg>

        {animated && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse-slow pointer-events-none" />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1
            className={`${currentSize.text} font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 leading-tight ${
              mounted && animated ? 'logo-text-shimmer' : ''
            }`}
          >
            Discovery to Deal
          </h1>
          <p className="text-xs text-gray-400 tracking-wide uppercase">Framework</p>
        </div>
      )}
    </div>
  );
}
