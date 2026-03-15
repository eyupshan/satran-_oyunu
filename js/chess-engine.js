// chess-engine.js — Complete Chess Rules Engine
class ChessEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = this.initBoard();
    this.turn = 'w';
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.moveHistory = [];
    this.capturedPieces = { w: [], b: [] };
    this.status = 'playing';
  }

  initBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const backRow = ['R','N','B','Q','K','B','N','R'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRow[col], color: 'b' };
      board[1][col] = { type: 'P', color: 'b' };
      board[7][col] = { type: backRow[col], color: 'w' };
      board[6][col] = { type: 'P', color: 'w' };
    }
    return board;
  }

  getPseudoLegalMoves(board, row, col, castlingRights, enPassantSquare) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const { type, color } = piece;

    const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

    const tryAdd = (toRow, toCol, extra = {}) => {
      if (!inBounds(toRow, toCol)) return;
      const target = board[toRow][toCol];
      if (!target || target.color !== color) {
        moves.push({ fromRow: row, fromCol: col, toRow, toCol, ...extra });
      }
    };

    const addSliding = (dirs) => {
      for (const [dr, dc] of dirs) {
        let r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (target) {
            if (target.color !== color) moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c });
            break;
          }
          moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c });
          r += dr; c += dc;
        }
      }
    };

    switch (type) {
      case 'P': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const promRow = color === 'w' ? 0 : 7;
        const nr = row + dir;
        // Forward one
        if (inBounds(nr, col) && !board[nr][col]) {
          if (nr === promRow) {
            for (const pt of ['Q','R','B','N'])
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, promotion: pt });
          } else {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col });
            // Double push
            if (row === startRow && !board[row + 2*dir][col]) {
              moves.push({ fromRow: row, fromCol: col, toRow: row + 2*dir, toCol: col, doublePush: true });
            }
          }
        }
        // Captures
        for (const dc of [-1, 1]) {
          const nc = col + dc;
          if (!inBounds(nr, nc)) continue;
          const target = board[nr][nc];
          if (target && target.color !== color) {
            if (nr === promRow) {
              for (const pt of ['Q','R','B','N'])
                moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, promotion: pt });
            } else {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
            }
          }
          // En passant
          if (enPassantSquare && enPassantSquare.row === nr && enPassantSquare.col === nc) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, enPassant: true });
          }
        }
        break;
      }
      case 'N':
        for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
          tryAdd(row+dr, col+dc);
        break;
      case 'B': addSliding([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
      case 'R': addSliding([[-1,0],[1,0],[0,-1],[0,1]]); break;
      case 'Q': addSliding([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); break;
      case 'K': {
        for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
          tryAdd(row+dr, col+dc);
        const kingRow = color === 'w' ? 7 : 0;
        if (row === kingRow && col === 4) {
          if (castlingRights[color+'K'] && !board[kingRow][5] && !board[kingRow][6]
              && board[kingRow][7]?.type === 'R' && board[kingRow][7]?.color === color)
            moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 6, castling: 'K' });
          if (castlingRights[color+'Q'] && !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1]
              && board[kingRow][0]?.type === 'R' && board[kingRow][0]?.color === color)
            moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 2, castling: 'Q' });
        }
        break;
      }
    }
    return moves;
  }

  isInCheck(board, color) {
    let kr = -1, kc = -1;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.type === 'K' && board[r][c]?.color === color) { kr = r; kc = c; }
    if (kr === -1) return false;
    const opp = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.color === opp) {
          const ms = this.getPseudoLegalMoves(board, r, c, { wK:false,wQ:false,bK:false,bQ:false }, null);
          if (ms.some(m => m.toRow === kr && m.toCol === kc)) return true;
        }
    return false;
  }

  applyMove(board, move) {
    const nb = board.map(row => row.map(cell => cell ? {...cell} : null));
    const piece = {...nb[move.fromRow][move.fromCol]};
    nb[move.toRow][move.toCol] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
    nb[move.fromRow][move.fromCol] = null;
    if (move.enPassant) {
      const er = piece.color === 'w' ? move.toRow + 1 : move.toRow - 1;
      nb[er][move.toCol] = null;
    }
    if (move.castling === 'K') { nb[move.toRow][5] = nb[move.toRow][7]; nb[move.toRow][7] = null; }
    if (move.castling === 'Q') { nb[move.toRow][3] = nb[move.toRow][0]; nb[move.toRow][0] = null; }
    return nb;
  }

  updateCRFromMove(cr, board, move) {
    const ncr = {...cr};
    const piece = board[move.fromRow][move.fromCol];
    if (!piece) return ncr;
    if (piece.type === 'K') { ncr[piece.color+'K'] = false; ncr[piece.color+'Q'] = false; }
    if (piece.type === 'R') {
      if (move.fromRow === 7 && move.fromCol === 0) ncr.wQ = false;
      if (move.fromRow === 7 && move.fromCol === 7) ncr.wK = false;
      if (move.fromRow === 0 && move.fromCol === 0) ncr.bQ = false;
      if (move.fromRow === 0 && move.fromCol === 7) ncr.bK = false;
    }
    return ncr;
  }

  getLegalMoves(board, color, castlingRights, enPassantSquare) {
    const legal = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color !== color) continue;
        const pseudos = this.getPseudoLegalMoves(board, r, c, castlingRights, enPassantSquare);
        for (const move of pseudos) {
          if (move.castling) {
            if (this.isInCheck(board, color)) continue;
            const passThroughCol = move.castling === 'K' ? 5 : 3;
            const kingRow = color === 'w' ? 7 : 0;
            const midBoard = this.applyMove(board, { fromRow: kingRow, fromCol: 4, toRow: kingRow, toCol: passThroughCol });
            if (this.isInCheck(midBoard, color)) continue;
          }
          const nb = this.applyMove(board, move);
          if (!this.isInCheck(nb, color)) legal.push(move);
        }
      }
    }
    return legal;
  }

  getLegalMovesForSquare(row, col) {
    return this.getLegalMoves(this.board, this.turn, this.castlingRights, this.enPassantSquare)
      .filter(m => m.fromRow === row && m.fromCol === col);
  }

  makeMove(move) {
    const piece = this.board[move.fromRow][move.fromCol];
    if (!piece || piece.color !== this.turn) return false;
    const legalMoves = this.getLegalMoves(this.board, this.turn, this.castlingRights, this.enPassantSquare);
    const isLegal = legalMoves.some(m =>
      m.fromRow === move.fromRow && m.fromCol === move.fromCol &&
      m.toRow === move.toRow && m.toCol === move.toCol &&
      m.promotion === move.promotion
    );
    if (!isLegal) return false;

    const captured = this.board[move.toRow][move.toCol];
    this.moveHistory.push({
      move: {...move},
      boardSnapshot: this.board.map(r => r.map(c => c ? {...c} : null)),
      castlingRights: {...this.castlingRights},
      enPassantSquare: this.enPassantSquare ? {...this.enPassantSquare} : null,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      capturedPieces: { w: [...this.capturedPieces.w], b: [...this.capturedPieces.b] }
    });

    if (captured) this.capturedPieces[this.turn].push({...captured});
    if (move.enPassant) {
      const er = piece.color === 'w' ? move.toRow + 1 : move.toRow - 1;
      const epCapture = this.board[er][move.toCol];
      if (epCapture) this.capturedPieces[this.turn].push({...epCapture});
    }

    this.board = this.applyMove(this.board, move);
    this.castlingRights = this.updateCRFromMove(this.castlingRights, this.moveHistory[this.moveHistory.length-1].boardSnapshot, move);
    this.enPassantSquare = move.doublePush
      ? { row: move.fromRow + (piece.color === 'w' ? -1 : 1), col: move.fromCol }
      : null;
    if (piece.type === 'P' || captured) this.halfMoveClock = 0;
    else this.halfMoveClock++;
    if (this.turn === 'b') this.fullMoveNumber++;
    this.turn = this.turn === 'w' ? 'b' : 'w';
    this.updateStatus();
    return true;
  }

  updateStatus() {
    const legal = this.getLegalMoves(this.board, this.turn, this.castlingRights, this.enPassantSquare);
    const inCheck = this.isInCheck(this.board, this.turn);
    if (legal.length === 0) this.status = inCheck ? 'checkmate' : 'stalemate';
    else if (inCheck) this.status = 'check';
    else if (this.halfMoveClock >= 100) this.status = 'draw';
    else this.status = 'playing';
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;
    const last = this.moveHistory.pop();
    this.board = last.boardSnapshot;
    this.castlingRights = last.castlingRights;
    this.enPassantSquare = last.enPassantSquare;
    this.halfMoveClock = last.halfMoveClock;
    this.fullMoveNumber = last.fullMoveNumber;
    this.capturedPieces = last.capturedPieces;
    this.turn = this.turn === 'w' ? 'b' : 'w';
    this.updateStatus();
    return true;
  }

  getMoveNotation(move, boardBefore) {
    const piece = boardBefore[move.fromRow][move.fromCol];
    if (!piece) return '';
    const files = 'abcdefgh';
    const ranks = '87654321';
    if (move.castling === 'K') return 'O-O';
    if (move.castling === 'Q') return 'O-O-O';
    const toSq = files[move.toCol] + ranks[move.toRow];
    const capture = (boardBefore[move.toRow][move.toCol] || move.enPassant) ? 'x' : '';
    const pieceChar = piece.type === 'P' ? '' : piece.type;
    const fromFile = piece.type === 'P' && capture ? files[move.fromCol] : '';
    const prom = move.promotion ? '=' + move.promotion : '';
    return pieceChar + fromFile + capture + toSq + prom;
  }

  // Load a position from a simplified FEN (for puzzles)
  loadFEN(fen) {
    const parts = fen.split(' ');
    const ranks = parts[0].split('/');
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of ranks[r]) {
        if (!isNaN(ch)) { c += parseInt(ch); }
        else {
          const color = ch === ch.toUpperCase() ? 'w' : 'b';
          this.board[r][c] = { type: ch.toUpperCase(), color };
          c++;
        }
      }
    }
    this.turn = (parts[1] || 'w');
    const castling = parts[2] || '-';
    this.castlingRights = {
      wK: castling.includes('K'), wQ: castling.includes('Q'),
      bK: castling.includes('k'), bQ: castling.includes('q')
    };
    this.enPassantSquare = null;
    if (parts[3] && parts[3] !== '-') {
      const files = 'abcdefgh';
      const c = files.indexOf(parts[3][0]);
      const r = 8 - parseInt(parts[3][1]);
      this.enPassantSquare = { row: r, col: c };
    }
    this.halfMoveClock = parseInt(parts[4] || 0);
    this.fullMoveNumber = parseInt(parts[5] || 1);
    this.moveHistory = [];
    this.capturedPieces = { w: [], b: [] };
    this.updateStatus();
  }
}
