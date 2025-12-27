
import React from 'react';
import { Player } from '../types.ts';

interface PieceProps {
  player: Player;
  isKing: boolean;
  isSelected?: boolean;
}

const Piece: React.FC<PieceProps> = ({ player, isKing, isSelected }) => {
  const baseClasses = "w-4/5 h-4/5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer";
  const colorClasses = player === 'red' 
    ? "bg-red-600 border-4 border-red-800" 
    : "bg-zinc-900 border-4 border-zinc-950";
  
  const selectedClasses = isSelected ? "ring-4 ring-amber-400 scale-110" : "";

  return (
    <div className={`${baseClasses} ${colorClasses} ${selectedClasses}`}>
      {isKing && (
        <span className="text-amber-400 text-lg font-bold">★</span>
      )}
      <div className="w-3/4 h-3/4 rounded-full border border-white/10 opacity-30"></div>
    </div>
  );
};

export default Piece;
