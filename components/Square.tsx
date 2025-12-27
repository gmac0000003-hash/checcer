
import React from 'react';

interface SquareProps {
  isDark: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const Square: React.FC<SquareProps> = ({ isDark, isHighlighted, onClick, children }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative w-full h-0 pb-[100%] flex items-center justify-center transition-colors duration-200
        ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
        ${isHighlighted ? 'after:absolute after:inset-0 after:bg-yellow-400/30 cursor-pointer' : ''}
      `}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Square;
