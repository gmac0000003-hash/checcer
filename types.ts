
export type Player = 'red' | 'black';

export interface Piece {
  id: string;
  player: Player;
  isKing: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type BoardState = (Piece | null)[][];

export interface Move {
  from: Position;
  to: Position;
  jumped?: Position;
}
