import React from 'react';

export function StaggerReveal({ children, staggerMs = 30, className = '' }: { children: React.ReactNode; staggerMs?: number; className?: string }) {
  let childIndex = 0;
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || child.type === React.Fragment) {
          return child;
        }
        const currentDelay = `${childIndex * staggerMs}ms`;
        const zIndex = 50 - childIndex;
        childIndex++;
        return (
          <div className="animate-popIn opacity-0 relative" style={{ animationDelay: currentDelay, animationFillMode: 'both', zIndex }}>
            {child}
          </div>
        );
      })}
    </div>
  );
}
