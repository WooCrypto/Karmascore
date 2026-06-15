import { SVGProps } from 'react';

interface KarmaLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  glow?: boolean;
  className?: string;
}

export default function KarmaLogo({ size = 32, glow = true, className = '', ...props }: KarmaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
      referrerPolicy="no-referrer"
      {...props}
    >
      <defs>
        {/* Deep, rich base gold representing the shadow bevel layer */}
        <linearGradient id="goldBase" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f3302" />
          <stop offset="20%" stopColor="#875b08" />
          <stop offset="50%" stopColor="#cca13b" />
          <stop offset="80%" stopColor="#875b08" />
          <stop offset="100%" stopColor="#2b1a01" />
        </linearGradient>

        {/* Primary rich golden metallic gradient */}
        <linearGradient id="goldMid" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFECA2" />
          <stop offset="25%" stopColor="#ECC452" />
          <stop offset="50%" stopColor="#B38A20" />
          <stop offset="75%" stopColor="#ecc452" />
          <stop offset="100%" stopColor="#FFE085" />
        </linearGradient>

        {/* High-contrast specular highlight (bright reflective ridges) */}
        <linearGradient id="goldHigh" x1="160" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FDD86B" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#926D0F" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
        </linearGradient>

        {/* Outer Glow Filter to mimic the ambient light in the dark UI */}
        <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5.5" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope="0.75" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow for 3D separation */}
        <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>

      <g filter={glow ? "url(#logoGlow)" : "url(#dropShadow)"}>
        {/* LAYER 1: Deep Metallic Base (Shadow layer and outer thick beveling) */}
        <g stroke="url(#goldBase)" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Circle Ambient */}
          <circle cx="28" cy="80" r="6" strokeWidth="5.5" fill="none" />
          {/* Right Circle Ambient */}
          <circle cx="132" cy="80" r="6" strokeWidth="5.5" fill="none" />

          {/* Top Diamond Diamond Accent */}
          <path d="M 80,31 L 91,42 L 80,53 L 69,42 Z" strokeWidth="5" fill="none" />
          {/* Bottom Diamond Accent */}
          <path d="M 80,129 L 91,118 L 80,107 L 69,118 Z" strokeWidth="5" fill="none" />

          {/* Outer diamond frame */}
          <path d="M 80,31 L 129,80 L 80,129 L 31,80 Z" strokeWidth="5.5" />

          {/* Core interlocking weaving bands */}
          <path d="M 80,31 L 118,69 L 107,80 L 80,53 L 53,80 L 42,69 Z" fill="url(#goldBase)" strokeWidth="1" />
          <path d="M 80,129 L 42,91 L 53,80 L 80,107 L 107,80 L 118,91 Z" fill="url(#goldBase)" strokeWidth="1" />

          {/* Inner loops */}
          <path d="M 53,80 L 80,53 L 107,80 L 80,107 L 53,80 Z" strokeWidth="5.5" />
          <path d="M 69,80 L 80,69 L 91,80 L 80,91 L 69,80 Z" strokeWidth="4.5" />

          {/* Corner structural ticks */}
          <path d="M 62,62 L 73,51 M 98,62 L 87,51 M 62,98 L 73,109 M 98,98 L 87,109" strokeWidth="4.5" />
        </g>

        {/* LAYER 2: Vibrant Golden Core (The main body of the logo) */}
        <g stroke="url(#goldMid)" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Circle Main */}
          <circle cx="28" cy="80" r="6" strokeWidth="3" fill="none" />
          {/* Right Circle Main */}
          <circle cx="132" cy="80" r="6" strokeWidth="3" fill="none" />

          {/* Top Diamond Diamond Accent */}
          <path d="M 80,31 L 91,42 L 80,53 L 69,42 Z" strokeWidth="2.5" fill="url(#goldMid)" />
          {/* Bottom Diamond Accent */}
          <path d="M 80,129 L 91,118 L 80,107 L 69,118 Z" strokeWidth="2.5" fill="url(#goldMid)" />

          {/* Outer diamond frame */}
          <path d="M 80,31 L 129,80 L 80,129 L 31,80 Z" strokeWidth="3" />

          {/* Core interlocking weaving bands */}
          <path d="M 80,31 L 118,69 L 107,80 L 80,53 L 53,80 L 42,69 Z" fill="url(#goldMid)" opacity="0.95" />
          <path d="M 80,129 L 42,91 L 53,80 L 80,107 L 107,80 L 118,91 Z" fill="url(#goldMid)" opacity="0.95" />

          {/* Inner loops */}
          <path d="M 53,80 L 80,53 L 107,80 L 80,107 L 53,80 Z" strokeWidth="3" />
          <path d="M 69,80 L 80,69 L 91,80 L 80,91 L 69,80 Z" strokeWidth="2.2" />

          {/* Corner structural ticks */}
          <path d="M 62,62 L 73,51 M 98,62 L 87,51 M 62,98 L 73,109 M 98,98 L 87,109" strokeWidth="2.2" />
        </g>

        {/* LAYER 3: Specular Highlighting (Produces the glorious metallic reflections and shine highlights) */}
        <g stroke="url(#goldHigh)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          {/* Left Circle Reflection */}
          <circle cx="28" cy="80" r="6.2" fill="none" />
          {/* Right Circle Reflection */}
          <circle cx="132" cy="80" r="6.2" fill="none" />

          {/* Outer diamond frame highlight */}
          <path d="M 80,32 L 128,80 L 80,128 L 32,80 Z" />

          {/* Inner structural highlight wires */}
          <path d="M 53.5,80 L 80,53.5 L 106.5,80 L 80,106.5 L 53.5,80 Z" />
          <path d="M 69.5,80 L 80,69.5 L 90.5,80 L 80,90.5 L 69.5,80 Z" />

          {/* Fine highlights on coordinate ticks */}
          <path d="M 62,62 L 73,51 M 98,62 L 87,51 M 62,98 L 73,109 M 98,98 L 87,109" strokeWidth="0.6" />
        </g>
      </g>
    </svg>
  );
}
