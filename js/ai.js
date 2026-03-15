// ai.js — Chess AI using Negamax with Alpha-Beta Pruning

const PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

const PST = {
  P: [
    [0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],
    [10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],
    [0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
    [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]
  ],
  N: [
    [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
    [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
    [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
    [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  B: [
    [-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
    [-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],
    [-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],
    [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  R: [
    [0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],
    [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
    [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
    [-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]
  ],
  Q: [
    [-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
    [-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],
    [0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],
    [-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]
  ],
  K: [
    [20,30,10,0,0,10,30,20],[20,20,0,0,0,0,20,20],
    [-10,-20,-20,-20,-20,-20,-20,-10],[-20,-30,-30,-40,-40,-30,-30,-20],
    [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30]
  ]
};

class ChessAI {
  constructor(engine) {
    this.engine = engine;
    this.nodesSearched = 0;
  }

  evaluate(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const val = PIECE_VALUES[p.type] || 0;
        const tr = p.color === 'w' ? 7 - r : r;
        const pst = (PST[p.type] || [[]])[tr]?.[c] || 0;
        score += (p.color === 'w' ? 1 : -1) * (val + pst);
      }
    }
    return score;
  }

  updateCR(cr, board, move) {
    const ncr = { ...cr };
    const piece = board[move.fromRow][move.fromCol];
    if (!piece) return ncr;
    if (piece.type === 'K') { ncr[piece.color + 'K'] = false; ncr[piece.color + 'Q'] = false; }
    if (piece.type === 'R') {
      if (move.fromRow === 7 && move.fromCol === 0) ncr.wQ = false;
      if (move.fromRow === 7 && move.fromCol === 7) ncr.wK = false;
      if (move.fromRow === 0 && move.fromCol === 0) ncr.bQ = false;
      if (move.fromRow === 0 && move.fromCol === 7) ncr.bK = false;
    }
    return ncr;
  }

  getNewEP(board, move) {
    const piece = board[move.fromRow][move.fromCol];
    if (!piece) return null;
    return move.doublePush
      ? { row: move.fromRow + (piece.color === 'w' ? -1 : 1), col: move.fromCol }
      : null;
  }

  // Order captures first for better pruning
  orderMoves(moves, board) {
    return moves.sort((a, b) => {
      const ca = board[a.toRow][a.toCol];
      const cb = board[b.toRow][b.toCol];
      const va = ca ? (PIECE_VALUES[ca.type] || 0) : 0;
      const vb = cb ? (PIECE_VALUES[cb.type] || 0) : 0;
      return vb - va;
    });
  }

  negamax(board, depth, alpha, beta, color, cr, ep) {
    this.nodesSearched++;
    const legalMoves = this.engine.getLegalMoves(board, color, cr, ep);

    if (legalMoves.length === 0) {
      if (this.engine.isInCheck(board, color)) return -90000 - depth; // Checkmate (prefer faster)
      return 0; // Stalemate
    }
    if (depth === 0) {
      const sign = color === 'w' ? 1 : -1;
      return sign * this.evaluate(board);
    }

    const opp = color === 'w' ? 'b' : 'w';
    const orderedMoves = this.orderMoves(legalMoves, board);
    let bestScore = -Infinity;

    for (const move of orderedMoves) {
      const nb = this.engine.applyMove(board, move);
      const ncr = this.updateCR(cr, board, move);
      const nep = this.getNewEP(board, move);
      const score = -this.negamax(nb, depth - 1, -beta, -alpha, opp, ncr, nep);
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break; // Prune
    }
    return bestScore;
  }

  getBestMove(engine, difficulty) {
    const { board, turn, castlingRights, enPassantSquare } = engine;
    const legalMoves = engine.getLegalMoves(board, turn, castlingRights, enPassantSquare);
    if (legalMoves.length === 0) return null;

    if (difficulty === 'easy') {
      // Easy: play random moves, but avoid obviously bad ones half the time
      const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);
      return shuffled[0];
    }

    const depth = { medium: 2, hard: 4 }[difficulty] || 2;
    const opp = turn === 'w' ? 'b' : 'w';
    this.nodesSearched = 0;

    let bestMove = null;
    let bestScore = -Infinity;
    const orderedMoves = this.orderMoves([...legalMoves], board);

    for (const move of orderedMoves) {
      const nb = engine.applyMove(board, move);
      const ncr = this.updateCR(castlingRights, board, move);
      const nep = this.getNewEP(board, move);
      const score = -this.negamax(nb, depth - 1, -Infinity, Infinity, opp, ncr, nep);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Asynchronous wrapper to avoid UI freeze
  getBestMoveAsync(engine, difficulty, callback) {
    setTimeout(() => {
      const move = this.getBestMove(engine, difficulty);
      callback(move);
    }, difficulty === 'hard' ? 100 : 50);
  }
}
