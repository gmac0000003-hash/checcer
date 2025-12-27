
import { BoardState, Player, Position, Move, Piece } from '../types.ts';

export const INITIAL_BOARD: BoardState = Array(8).fill(null).map((_, r) => 
  Array(8).fill(null).map((_, c) => {
    if ((r + c) % 2 === 1) {
      if (r < 3) return { id: `black-${r}-${c}`, player: 'black', isKing: false };
      if (r > 4) return { id: `red-${r}-${c}`, player: 'red', isKing: false };
    }
    return null;
  })
);

export const isValidMove = (board: BoardState, move: Move, currentPlayer: Player): boolean => {
  const { from, to } = move;
  if (to.row < 0 || to.row >= 8 || to.col < 0 || to.col >= 8) return false;
  
  const piece = board[from.row][from.col];
  if (!piece || piece.player !== currentPlayer) return false;
  if (board[to.row][to.col] !== null) return false;
  if ((to.row + to.col) % 2 === 0) return false;

  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);
  const direction = currentPlayer === 'red' ? -1 : 1;

  if (Math.abs(rowDiff) === 1 && colDiff === 1) {
    if (!piece.isKing && rowDiff !== direction) return false;
    return true;
  }

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
  const rowDeltas = piece.isKing ? [-2, -1, 1, 2] : (player === 'red' ? [-1, -2] : [1, 2]);

  for (const dr of rowDeltas) {
    for (const dc of [-2, -1, 1, 2]) {
      if (Math.abs(dr) !== Math.abs(dc)) continue;
      const target = { row: pos.row + dr, col: pos.col + dc };
      const move = { from: pos, to: target };
      if (isValidMove(board, move, player)) {
        moves.push(move);
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
  const jumpMoves = moves.filter(m => Math.abs(m.to.row - m.from.row) === 2);
  return jumpMoves.length > 0 ? jumpMoves : moves;
};

export const executeMove = (board: BoardState, move: Move): { newBoard: BoardState, jumpTaken: boolean } => {
  const { from, to } = move;
  const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
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

  if (piece.player === 'red' && to.row === 0) piece.isKing = true;
  if (piece.player === 'black' && to.row === 7) piece.isKing = true;

  return { newBoard, jumpTaken };
};
