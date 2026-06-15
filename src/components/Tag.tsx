import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: string;
}

export default function Tag({ children, color = '#a78bfa' }: TagProps) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] uppercase font-mono font-bold tracking-wider select-none whitespace-nowrap"
      style={{
        background: `${color}12`,
        borderColor: `${color}35`,
        color: color,
        letterSpacing: '0.08em',
      }}
    >
      {children}
    </span>
  );
}
