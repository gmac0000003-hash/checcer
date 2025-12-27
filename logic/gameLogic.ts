
import { BoardState, Player, Position, Move, Piece } from '../types';

export const INITIAL_BOARD: BoardState = Array(8).fill(null).map((_, r) => 
  Array(8).fill(null).map((_, c) => {
    // Only dark squares can have pieces: (row + col) % 2 === 1
    if ((r + c) % 2 === 1) {
      if (r < 3) return { id: `black-${r}-${c}`, player: 'black', isKing: false };
      if (r > 4) return { id: `red-${r}-${c}`, player: 'red', isKing: false };
    }
    return null;
  })
);

export const isValidMove = (board: BoardState, move: Move, currentPlayer: Player): boolean => {
  const { from, to } = move;
  const piece = board[from.row][from.col];

  if (!piece || piece.player !== currentPlayer) return false;
  if (board[to.row][to.col] !== null) return false;
  if ((to.row + to.col) % 2 === 0) return false; // Must be dark square

  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);
  const direction = currentPlayer === 'red' ? -1 : 1;

  // Standard moves
  if (Math.abs(rowDiff) === 1 && colDiff === 1) {
    if (!piece.isKing && rowDiff !== direction) return false;
    return true;
  }

  // Jumps
  if (Math.abs(rowDiff) === 2 && colDiff === 2) {
    if (!piece.isKing && Math.sign(rowDiff) !== direction) return false;
    const midRow = from.row + rowDiff / 2;
    const midCol = from.col + (to.col - from.col) / 2;
    const midPiece = board[midRow][midCol];
    return midPiece !== null && midPiece.player !== currentPlayer;
  }

  return false;
};

export const getValidMovesForPiece = (board: BoardState, pos: Position, player: Player): Move[] => {
  const piece = board[pos.row][pos.col];
  if (!piece || piece.player !== player) return [];

  const moves: Move[] = [];
  const deltas = piece.isKing ? [-2, -1, 1, 2] : (player === 'red' ? [-1, -2] : [1, 2]);

  for (const dr of deltas) {
    for (const dc of [-2, -1, 1, 2]) {
      if (Math.abs(dr) !== Math.abs(dc)) continue;
      const target = { row: pos.row + dr, col: pos.col + dc };
      if (target.row >= 0 && target.row < 8 && target.col >= 0 && target.col < 8) {
        const move = { from: pos, to: target };
        if (isValidMove(board, move, player)) {
          moves.push(move);
        }
      }
    }
  }
  return moves;
};

export const getAllPossibleMoves = (board: BoardState, player: Player): Move[] => {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      moves.push(...getValidMovesForPiece(board, { row: r, col: c }, player));
    }
  }
  
  // Rule check: If a jump is available, it must be taken (optional standard rule)
  const jumpMoves = moves.filter(m => Math.abs(m.to.row - m.from.row) === 2);
  return jumpMoves.length > 0 ? jumpMoves : moves;
};

export const executeMove = (board: BoardState, move: Move): { newBoard: BoardState, jumpTaken: boolean } => {
  const { from, to } = move;
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col]!;
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  let jumpTaken = false;
  if (Math.abs(to.row - from.row) === 2) {
    const midRow = from.row + (to.row - from.row) / 2;
    const midCol = from.col + (to.col - from.col) / 2;
    newBoard[midRow][midCol] = null;
    jumpTaken = true;
  }

  // King promotion
  if (piece.player === 'red' && to.row === 0) piece.isKing = true;
  if (piece.player === 'black' && to.row === 7) piece.isKing = true;

  return { newBoard, jumpTaken };
};
