
import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, Player, Position, Move } from './types';
import { INITIAL_BOARD, getAllPossibleMoves, executeMove, getValidMovesForPiece } from './logic/gameLogic';
import Square from './components/Square';
import PieceComponent from './components/Piece';
import { analyzeBoard } from './services/geminiService';

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check game over
  useEffect(() => {
    const possibleMoves = getAllPossibleMoves(board, currentPlayer);
    if (possibleMoves.length === 0) {
      setWinner(currentPlayer === 'red' ? 'black' : 'red');
    }
  }, [board, currentPlayer]);

  const handleSquareClick = (row: number, col: number) => {
    if (winner) return;

    const clickedPiece = board[row][col];
    
    // If selecting a piece
    if (clickedPiece && clickedPiece.player === currentPlayer) {
      setSelectedPos({ row, col });
      setValidMoves(getValidMovesForPiece(board, { row, col }, currentPlayer));
      return;
    }

    // If attempting a move
    if (selectedPos) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        const { newBoard, jumpTaken } = executeMove(board, move);
        
        // Multi-jump logic: check if same piece has more jumps available
        if (jumpTaken) {
          const nextJumps = getValidMovesForPiece(newBoard, move.to, currentPlayer)
            .filter(m => Math.abs(m.to.row - m.from.row) === 2);
          
          if (nextJumps.length > 0) {
            setBoard(newBoard);
            setSelectedPos(move.to);
            setValidMoves(nextJumps);
            return;
          }
        }

        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
        setSelectedPos(null);
        setValidMoves([]);
        setAnalysis(null);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeBoard(board, currentPlayer);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('red');
    setSelectedPos(null);
    setValidMoves([]);
    setWinner(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center p-4">
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
            MASTER CHECKERS
          </h1>
          <p className="text-zinc-500 text-sm">Professional PWA Edition</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            currentPlayer === 'red' ? 'bg-red-600 shadow-lg shadow-red-600/20' : 'bg-zinc-800'
          }`}>
            RED'S TURN
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            currentPlayer === 'black' ? 'bg-zinc-200 text-black shadow-lg shadow-white/20' : 'bg-zinc-800'
          }`}>
            BLACK'S TURN
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Stats/Status */}
        <div className="order-2 lg:order-1 space-y-4">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-2 h-6 bg-red-600 mr-2 rounded"></span>
              Game Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl text-center">
                <div className="text-zinc-500 text-xs uppercase mb-1">Red Pieces</div>
                <div className="text-2xl font-bold">{board.flat().filter(p => p?.player === 'red').length}</div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl text-center">
                <div className="text-zinc-500 text-xs uppercase mb-1">Black Pieces</div>
                <div className="text-2xl font-bold">{board.flat().filter(p => p?.player === 'black').length}</div>
              </div>
            </div>
            
            <button 
              onClick={resetGame}
              className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
            >
              Restart Match
            </button>
          </div>

          {winner && (
            <div className="bg-green-600 p-6 rounded-2xl animate-bounce-slow flex flex-col items-center">
              <h2 className="text-2xl font-black uppercase mb-2">Game Over!</h2>
              <p className="text-lg">{winner === 'draw' ? "It's a draw!" : `${winner.toUpperCase()} WINS!`}</p>
            </div>
          )}
        </div>

        {/* Center: The Board */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="w-full max-w-[512px] aspect-square bg-zinc-700 p-2 rounded shadow-2xl ring-4 ring-zinc-800 overflow-hidden">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {board.map((row, r) => 
                row.map((piece, c) => {
                  const isHighlighted = validMoves.some(m => m.to.row === r && m.to.col === c);
                  const isSelected = selectedPos?.row === r && selectedPos?.col === c;
                  
                  return (
                    <Square 
                      key={`${r}-${c}`} 
                      isDark={(r + c) % 2 === 1}
                      isHighlighted={isHighlighted}
                      onClick={() => handleSquareClick(r, c)}
                    >
                      {piece && (
                        <PieceComponent 
                          player={piece.player} 
                          isKing={piece.isKing} 
                          isSelected={isSelected}
                        />
                      )}
                    </Square>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Gemini AI Analysis */}
        <div className="order-3 space-y-4">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-2xl min-h-[300px] flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-2 h-6 bg-amber-500 mr-2 rounded"></span>
              AI Analyst (Gemini)
            </h3>
            
            {analysis ? (
              <div className="flex-1 space-y-4 animate-in fade-in duration-500">
                <div className="bg-zinc-950 p-4 rounded-xl">
                  <p className="text-zinc-400 text-sm leading-relaxed">{analysis.analysis}</p>
                </div>
                <div className="flex items-center justify-between">
                   <div>
                     <div className="text-zinc-500 text-xs uppercase">Best Move</div>
                     <div className="text-amber-400 font-bold">{analysis.bestMove}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-zinc-500 text-xs uppercase">Confidence</div>
                     <div className="text-zinc-300">{(analysis.confidence * 100).toFixed(0)}%</div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-zinc-500 text-sm">Need a hint? Ask Gemini to analyze the board.</p>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    isAnalyzing ? 'bg-zinc-800 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 hover:scale-105'
                  }`}
                >
                  {isAnalyzing ? 'Thinking...' : 'Analyze Board'}
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center p-4">
            <p className="text-xs text-zinc-600">This PWA works offline. Install it for the best experience.</p>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-zinc-700 text-xs">
        &copy; 2024 Master Checkers. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;
