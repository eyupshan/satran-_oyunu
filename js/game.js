// game.js — Game Controller

class ChessGame {
  constructor() {
    this.engine = new ChessEngine();
    this.ai = new ChessAI(this.engine);
    this.renderer = new BoardRenderer('chess-board', {
      onSquareClick: (row, col) => this.handleSquareClick(row, col)
    });
    this.difficulty = 'medium';
    this.playerColor = 'w';
    this.selectedSquare = null;
    this.legalMoves = [];
    this.gameOver = false;
    this.aiThinking = false;
    this.moveHistoryNotations = [];
    this.timers = { w: 600, b: 600 }; // 10 min each
    this.activeTimer = null;
    this.timerInterval = null;

    this.setupEventListeners();
    this.startNewGame();
  }

  setupEventListeners() {
    document.getElementById('btn-new-game')?.addEventListener('click', () => this.showNewGameModal());
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undoMove());
    document.getElementById('btn-flip')?.addEventListener('click', () => this.flipBoard());
    document.getElementById('btn-resign')?.addEventListener('click', () => this.resign());

    // Modal buttons
    document.getElementById('modal-start')?.addEventListener('click', () => {
      const diff = document.getElementById('modal-difficulty')?.value || 'medium';
      const color = document.getElementById('modal-color')?.value || 'w';
      this.difficulty = diff;
      this.playerColor = color;
      document.getElementById('new-game-modal').style.display = 'none';
      this.startNewGame();
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => {
      document.getElementById('new-game-modal').style.display = 'none';
    });

    // Promotion modal
    document.querySelectorAll('.promo-piece').forEach(btn => {
      btn.addEventListener('click', () => {
        const pieceType = btn.dataset.piece;
        this.pendingPromotion.promotion = pieceType;
        document.getElementById('promotion-modal').style.display = 'none';
        this.finalizePendingMove();
      });
    });
  }

  showNewGameModal() {
    document.getElementById('new-game-modal').style.display = 'flex';
  }

  startNewGame() {
    this.engine.reset();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.gameOver = false;
    this.aiThinking = false;
    this.moveHistoryNotations = [];
    this.timers = { w: 600, b: 600 };
    clearInterval(this.timerInterval);
    this.activeTimer = 'w';

    this.renderer.flipped = this.playerColor === 'b';
    this.renderer.lastMove = null;
    this.renderer.selectedSquare = null;
    this.renderer.legalMoveTargets = [];

    this.renderer.render(this.engine.board);
    this.updateUI();
    this.updateMoveHistory();
    this.updateCapturedPieces();
    this.updateStatus('Oyun Başladı! ' + (this.playerColor === 'w' ? 'Beyaz' : 'Siyah') + ' oynuyorsunuz.');

    this.startTimers();

    // If AI goes first (player chose black)
    if (this.playerColor === 'b') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  startTimers() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.gameOver || this.aiThinking) return;
      const active = this.engine.turn;
      if (this.timers[active] > 0) {
        this.timers[active]--;
        this.updateTimerDisplay();
      } else {
        this.endGame(active === 'w' ? 'b' : 'w', 'Süre doldu!');
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const fmt = secs => {
      const m = Math.floor(secs / 60).toString().padStart(2,'0');
      const s = (secs % 60).toString().padStart(2,'0');
      return `${m}:${s}`;
    };
    const wEl = document.getElementById('timer-white');
    const bEl = document.getElementById('timer-black');
    if (wEl) {
      wEl.textContent = fmt(this.timers.w);
      wEl.classList.toggle('active-timer', this.engine.turn === 'w' && !this.gameOver);
    }
    if (bEl) {
      bEl.textContent = fmt(this.timers.b);
      bEl.classList.toggle('active-timer', this.engine.turn === 'b' && !this.gameOver);
    }
  }

  handleSquareClick(row, col) {
    if (this.gameOver || this.aiThinking) return;
    if (this.engine.turn !== this.playerColor) return;

    const piece = this.engine.board[row][col];

    if (!this.selectedSquare) {
      // Select a piece
      if (piece && piece.color === this.playerColor) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.engine.getLegalMovesForSquare(row, col);
        this.renderer.setHighlights(
          this.selectedSquare, this.legalMoves,
          this.renderer.lastMove,
          this.engine.status === 'check' ? this.engine.turn : null,
          this.engine.board
        );
      }
    } else {
      // Try to move to this square
      const moveMatch = this.legalMoves.filter(m => m.toRow === row && m.toCol === col);
      if (moveMatch.length > 0) {
        // Check if promotion needed
        const promoMoves = moveMatch.filter(m => m.promotion);
        if (promoMoves.length > 0) {
          this.pendingPromotion = { fromRow: this.selectedSquare.row, fromCol: this.selectedSquare.col, toRow: row, toCol: col };
          this.showPromotionModal();
        } else {
          this.executeMove(moveMatch[0]);
        }
      } else if (piece && piece.color === this.playerColor) {
        // Select new piece
        this.selectedSquare = { row, col };
        this.legalMoves = this.engine.getLegalMovesForSquare(row, col);
        this.renderer.setHighlights(
          this.selectedSquare, this.legalMoves,
          this.renderer.lastMove,
          this.engine.status === 'check' ? this.engine.turn : null,
          this.engine.board
        );
      } else {
        // Deselect
        this.selectedSquare = null;
        this.legalMoves = [];
        this.renderer.setHighlights(null, [], this.renderer.lastMove,
          this.engine.status === 'check' ? this.engine.turn : null, this.engine.board);
      }
    }
  }

  showPromotionModal() {
    const modal = document.getElementById('promotion-modal');
    if (!modal) return;
    const pc = this.playerColor;
    modal.querySelectorAll('.promo-piece').forEach(btn => {
      const type = btn.dataset.piece;
      btn.innerHTML = PIECE_SVGS[pc + type] || type;
    });
    modal.style.display = 'flex';
  }

  finalizePendingMove() {
    if (!this.pendingPromotion) return;
    const move = this.legalMoves.find(m =>
      m.fromRow === this.pendingPromotion.fromRow &&
      m.fromCol === this.pendingPromotion.fromCol &&
      m.toRow === this.pendingPromotion.toRow &&
      m.toCol === this.pendingPromotion.toCol &&
      m.promotion === this.pendingPromotion.promotion
    );
    if (move) this.executeMove(move);
    this.pendingPromotion = null;
  }

  executeMove(move) {
    const boardBefore = this.engine.board.map(r => r.map(c => c ? {...c} : null));
    const notation = this.engine.getMoveNotation(move, boardBefore);
    const success = this.engine.makeMove(move);
    if (!success) return;

    this.selectedSquare = null;
    this.legalMoves = [];
    this.moveHistoryNotations.push({ move, notation, color: this.engine.turn === 'w' ? 'b' : 'w' });
    this.renderer.lastMove = move;
    this.renderer.render(this.engine.board);
    this.renderer.setHighlights(null, [], move,
      this.engine.status === 'check' ? this.engine.turn : null, this.engine.board);
    this.updateMoveHistory();
    this.updateCapturedPieces();
    this.updateUI();

    if (this.engine.status === 'checkmate') {
      const winner = this.engine.turn === 'w' ? 'Siyah' : 'Beyaz';
      setTimeout(() => this.endGame(null, `${winner} Mat ile Kazandı! 🎉`), 100);
    } else if (this.engine.status === 'stalemate') {
      setTimeout(() => this.endGame(null, 'Pat! Beraberlik. 🤝'), 100);
    } else if (this.engine.status === 'draw') {
      setTimeout(() => this.endGame(null, 'Beraberlik! (50 hamle kuralı)'), 100);
    } else if (this.engine.status === 'check') {
      this.updateStatus('Şah! ♔');
      this.playSound('check');
    } else {
      this.updateStatus(this.engine.turn === 'w' ? 'Beyazın sırası' : 'Siyahın sırası');
    }

    // AI move
    if (!this.gameOver && this.engine.turn !== this.playerColor) {
      setTimeout(() => this.makeAIMove(), 300);
    }
  }

  makeAIMove() {
    if (this.gameOver) return;
    this.aiThinking = true;
    this.updateStatus('Bilgisayar düşünüyor... 🤔');

    this.ai.getBestMoveAsync(this.engine, this.difficulty, (move) => {
      this.aiThinking = false;
      if (!move) return;
      this.executeMove(move);
    });
  }

  undoMove() {
    if (this.gameOver) return;
    // Undo twice: AI move + player move
    const undone1 = this.engine.undoMove();
    if (!undone1) return;
    if (this.engine.turn !== this.playerColor) {
      this.engine.undoMove();
    }
    this.moveHistoryNotations = this.moveHistoryNotations.slice(0, -2);
    this.selectedSquare = null;
    this.legalMoves = [];
    const lastMoveEntry = this.moveHistoryNotations[this.moveHistoryNotations.length - 1];
    this.renderer.lastMove = lastMoveEntry ? lastMoveEntry.move : null;
    this.renderer.render(this.engine.board);
    this.renderer.setHighlights(null, [], this.renderer.lastMove, null, this.engine.board);
    this.updateMoveHistory();
    this.updateCapturedPieces();
    this.updateUI();
    this.updateStatus('Hamle geri alındı');
  }

  flipBoard() {
    this.renderer.flip();
    this.renderer.render(this.engine.board);
    this.renderer.setHighlights(
      this.selectedSquare, this.legalMoves, this.renderer.lastMove,
      this.engine.status === 'check' ? this.engine.turn : null, this.engine.board
    );
  }

  resign() {
    if (this.gameOver) return;
    const opp = this.playerColor === 'w' ? 'Siyah' : 'Beyaz';
    this.endGame(null, `Yenildiniz! ${opp} Kazandı 🏆`);
  }

  endGame(winner, message) {
    this.gameOver = true;
    clearInterval(this.timerInterval);
    this.updateStatus(message);
    setTimeout(() => {
      this.showGameOverModal(message);
    }, 500);
  }

  showGameOverModal(message) {
    const modal = document.getElementById('gameover-modal');
    if (!modal) return;
    document.getElementById('gameover-msg').textContent = message;
    modal.style.display = 'flex';
    document.getElementById('gameover-newgame')?.addEventListener('click', () => {
      modal.style.display = 'none';
      this.showNewGameModal();
    });
  }

  updateMoveHistory() {
    const container = document.getElementById('move-history');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < this.moveHistoryNotations.length; i += 2) {
      const moveNum = document.createElement('div');
      moveNum.className = 'move-row';
      const numEl = document.createElement('span');
      numEl.className = 'move-num';
      numEl.textContent = (Math.floor(i/2) + 1) + '.';
      moveNum.appendChild(numEl);

      const wMove = this.moveHistoryNotations[i];
      const bMove = this.moveHistoryNotations[i+1];

      const wEl = document.createElement('span');
      wEl.className = 'move-notation white-move' + (i === this.moveHistoryNotations.length - 1 ? ' current' : '');
      wEl.textContent = wMove?.notation || '';
      moveNum.appendChild(wEl);

      if (bMove) {
        const bEl = document.createElement('span');
        bEl.className = 'move-notation black-move' + (i+1 === this.moveHistoryNotations.length - 1 ? ' current' : '');
        bEl.textContent = bMove.notation;
        moveNum.appendChild(bEl);
      }

      container.appendChild(moveNum);
    }
    container.scrollTop = container.scrollHeight;
  }

  updateCapturedPieces() {
    this.renderer.renderCaptured(this.engine.capturedPieces.w, 'captured-by-white');
    this.renderer.renderCaptured(this.engine.capturedPieces.b, 'captured-by-black');
  }

  updateStatus(msg) {
    const el = document.getElementById('game-status');
    if (el) el.textContent = msg || '';
  }

  updateUI() {
    this.updateTimerDisplay();
    const diffEl = document.getElementById('current-difficulty');
    if (diffEl) {
      const labels = { easy: 'Kolay 😊', medium: 'Orta 🧠', hard: 'Zor 💀' };
      diffEl.textContent = labels[this.difficulty] || this.difficulty;
    }
  }

  playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === 'check' ? 880 : 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }
}

// Start game on page load
document.addEventListener('DOMContentLoaded', () => {
  window.game = new ChessGame();
  document.getElementById('new-game-modal').style.display = 'flex';
});
