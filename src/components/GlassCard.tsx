import React, { useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
  className?: string;
}

export default function GlassCard({ children, style = {}, hover = false, onClick, id, className = '', ...rest }: GlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={id}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={`transition-all duration-300 relative overflow-hidden ${className}`}
      {...rest}
      style={{
        background: 'rgba(12, 12, 26, 0.72)',
        border: `1px solid ${isHovered ? 'rgba(167, 139, 250, 0.38)' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: 20,
        backdropFilter: 'blur(24px)',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(167, 139, 250, 0.15), 0 0 0 1px rgba(167, 139, 250, 0.05)' 
          : '0 4px 24px rgba(0, 0, 0, 0.35)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Background soft glow when hovered */}
      {hover && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 120%, rgba(167, 139, 250, 0.08), transparent 70%)',
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
