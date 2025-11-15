
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;