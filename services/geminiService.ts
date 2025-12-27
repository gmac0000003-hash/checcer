
import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeBoard(board: BoardState, currentPlayer: Player) {
  const boardStr = board.map(row => 
    row.map(p => p ? (p.player === 'red' ? (p.isKing ? 'RK' : 'R') : (p.isKing ? 'BK' : 'B')) : '.').join(' ')
  ).join('\n');

  const prompt = `
    Analyze this 8x8 Checkers board. R=Red, B=Black, RK=Red King, BK=Black King, .=Empty.
    Current Turn: ${currentPlayer}
    Board:
    ${boardStr}
    
    Provide a strategic summary and the best next move for ${currentPlayer}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            bestMove: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["analysis", "bestMove", "confidence"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini analysis failed", err);
    return null;
  }
}
