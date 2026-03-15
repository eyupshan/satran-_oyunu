// challenges.js — Daily Chess Puzzles

const PUZZLES = [
  {
    id: 1, title: 'Vezirle Mat', day: 0,
    difficulty: 'Kolay', icon: '⭐',
    description: 'Siyah oynar. Vezirle tek hamlede mat verin!',
    fen: '6k1/5ppp/8/8/8/8/8/3q2K1 b - - 0 1',
    solution: [{ fromRow: 7, fromCol: 3, toRow: 7, toCol: 6 }],
    hint: 'Vezir köşeden köşeye!',
    solutionText: 'Qd1-g1#'
  },
  {
    id: 2, title: 'Çatal Taktik', day: 1,
    difficulty: 'Kolay', icon: '⭐⭐',
    description: 'Beyaz oynar. At ile çatal kurarak iki taşı birden tehdit edin!',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    solution: [{ fromRow: 5, fromCol: 5, toRow: 4, toCol: 3 }],
    hint: 'Atı ortaya atın!',
    solutionText: 'Nf3-d4',
    isMultiMove: false
  },
  {
    id: 3, title: 'Rook Sonu', day: 2,
    difficulty: 'Orta', icon: '⭐⭐⭐',
    description: 'Beyaz oynar. Kale ile 7. sırayı kontrol edin!',
    fen: '6k1/8/6K1/8/8/8/8/7R w - - 0 1',
    solution: [{ fromRow: 7, fromCol: 7, toRow: 1, toCol: 7 }],
    hint: '7. sıra, 7. sıra!',
    solutionText: 'Rh1-h7+'
  },
  {
    id: 4, title: 'Arka Sıra Matı', day: 3,
    difficulty: 'Orta', icon: '⭐⭐⭐',
    description: 'Beyaz oynar. Arka sıra zayıflığını sömürün!',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: [{ fromRow: 7, fromCol: 3, toRow: 0, toCol: 3 }],
    hint: 'Kale 8. sıraya!',
    solutionText: 'Rd1-d8#'
  },
  {
    id: 5, title: 'İğne Taktik', day: 4,
    difficulty: 'Orta', icon: '⭐⭐⭐',
    description: 'Beyaz oynar. Fil ile iğne kurarak malzeme kazanın!',
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bBPP3/5N2/PPP2PPP/RNBQK2R w KQkq - 2 5',
    solution: [{ fromRow: 3, fromCol: 7, toRow: 3, toCol: 1 }],
    hint: 'Siyahın filine iğne kur!',
    solutionText: 'Qa4'
  },
  {
    id: 6, title: 'Piyon Terf', day: 5,
    difficulty: 'Zor', icon: '⭐⭐⭐⭐',
    description: 'Beyaz oynar. Piyonunuzu terfi ettirin!',
    fen: '8/P5k1/8/8/8/8/8/6K1 w - - 0 1',
    solution: [{ fromRow: 1, fromCol: 0, toRow: 0, toCol: 0, promotion: 'Q' }],
    hint: 'Piyon ilerlesin!',
    solutionText: 'a7-a8=Q'
  },
  {
    id: 7, title: 'Şah Kaçışı', day: 6,
    difficulty: 'Zor', icon: '⭐⭐⭐⭐⭐',
    description: 'Siyah oynar. Şahtan tek güvenli kaçış yolunu bulun!',
    fen: 'r1bqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 2 3',
    solution: [{ fromRow: 0, fromCol: 4, toRow: 0, toCol: 3 }],
    hint: 'Kral kaleye doğru!',
    solutionText: 'Ke8-d8'
  }
];

class ChallengesManager {
  constructor() {
    this.engine = new ChessEngine();
    this.renderer = null;
    this.currentPuzzle = null;
    this.playerColor = 'w';
    this.selectedSquare = null;
    this.legalMoves = [];
    this.solutionMoves = [];
    this.currentSolutionIdx = 0;
    this.solved = false;
    this.failed = false;
    this.progress = this.loadProgress();
    this.renderPuzzleList();
  }

  loadProgress() {
    try { return JSON.parse(localStorage.getItem('chess-challenge-progress') || '{}'); } catch { return {}; }
  }
  saveProgress(id) {
    this.progress[id] = { solved: true, date: new Date().toISOString() };
    localStorage.setItem('chess-challenge-progress', JSON.stringify(this.progress));
  }

  renderPuzzleList() {
    const container = document.getElementById('puzzle-list');
    if (!container) return;
    const today = new Date().getDay();
    container.innerHTML = '';

    PUZZLES.forEach(puzzle => {
      const isToday = puzzle.day === today;
      const isSolved = this.progress[puzzle.id]?.solved;
      const card = document.createElement('div');
      card.className = 'puzzle-card card' + (isToday ? ' today-puzzle' : '') + (isSolved ? ' solved-puzzle' : '');
      card.innerHTML = `
        <div class="puzzle-card-top">
          <div class="puzzle-num">${puzzle.icon}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h3 style="font-size:1rem">${puzzle.title}</h3>
              ${isToday ? '<span class="badge badge-gold">📅 Bugün</span>' : ''}
              ${isSolved ? '<span class="badge badge-green">✓ Çözüldü</span>' : ''}
            </div>
            <span class="badge badge-purple" style="margin-top:4px">${puzzle.difficulty}</span>
          </div>
        </div>
        <p style="color:var(--text-secondary);font-size:0.88rem;margin:8px 0">${puzzle.description}</p>
        <button class="btn ${isToday ? 'btn-gold' : 'btn-primary'}" style="width:100%;justify-content:center;margin-top:8px" data-puzzle-id="${puzzle.id}">
          ${isSolved ? '🔁 Tekrar Oyna' : '▶ Başla'}
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => this.loadPuzzle(puzzle.id));
      container.appendChild(card);
    });
  }

  loadPuzzle(puzzleId) {
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (!puzzle) return;
    this.currentPuzzle = puzzle;
    this.solved = false;
    this.failed = false;
    this.currentSolutionIdx = 0;
    this.solutionMoves = puzzle.solution || [];
    this.selectedSquare = null;
    this.legalMoves = [];

    this.engine.reset();
    this.engine.loadFEN(puzzle.fen);
    this.playerColor = this.engine.turn;

    // Create/update renderer
    if (!this.renderer) {
      this.renderer = new BoardRenderer('puzzle-board', {
        onSquareClick: (row, col) => this.handleSquareClick(row, col)
      });
    }
    this.renderer.flipped = this.playerColor === 'b';
    this.renderer.lastMove = null;
    this.renderer.selectedSquare = null;
    this.renderer.legalMoveTargets = [];
    this.renderer.render(this.engine.board);

    // Show puzzle panel
    document.getElementById('puzzle-panel')?.classList.remove('hidden');
    document.getElementById('puzzle-title-display').textContent = puzzle.title;
    document.getElementById('puzzle-desc-display').textContent = puzzle.description;
    document.getElementById('puzzle-difficulty-display').textContent = puzzle.difficulty;
    document.getElementById('puzzle-feedback').textContent = '';
    document.getElementById('puzzle-feedback').className = 'puzzle-feedback';
    document.getElementById('puzzle-hint-text').classList.add('hidden');
    document.getElementById('puzzle-solution-text').classList.add('hidden');

    const turnText = this.playerColor === 'w' ? 'Beyaz' : 'Siyah';
    this.setFeedback(`${turnText} oynar. ${puzzle.description}`, '');

    // Scroll to puzzle board
    document.getElementById('puzzle-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  handleSquareClick(row, col) {
    if (this.solved || this.failed) return;
    if (this.engine.turn !== this.playerColor) return;

    const piece = this.engine.board[row][col];

    if (!this.selectedSquare) {
      if (piece && piece.color === this.playerColor) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.engine.getLegalMovesForSquare(row, col);
        this.renderer.setHighlights(this.selectedSquare, this.legalMoves, null, null, this.engine.board);
      }
    } else {
      const moveMatch = this.legalMoves.filter(m => m.toRow === row && m.toCol === col);
      if (moveMatch.length > 0) {
        const move = moveMatch[0];
        // Check if this matches the solution
        this.checkSolutionMove(move);
      } else if (piece && piece.color === this.playerColor) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.engine.getLegalMovesForSquare(row, col);
        this.renderer.setHighlights(this.selectedSquare, this.legalMoves, null, null, this.engine.board);
      } else {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.renderer.setHighlights(null, [], null, null, this.engine.board);
      }
    }
  }

  checkSolutionMove(playerMove) {
    if (this.currentSolutionIdx >= this.solutionMoves.length) return;
    const expected = this.solutionMoves[this.currentSolutionIdx];
    const isCorrect = playerMove.fromRow === expected.fromRow &&
      playerMove.fromCol === expected.fromCol &&
      playerMove.toRow === expected.toRow &&
      playerMove.toCol === expected.toCol;

    if (isCorrect) {
      // Apply promotion if needed
      if (expected.promotion) playerMove.promotion = expected.promotion;
      this.engine.makeMove(playerMove);
      this.selectedSquare = null;
      this.legalMoves = [];
      this.renderer.lastMove = playerMove;
      this.renderer.render(this.engine.board);
      this.renderer.setHighlights(null, [], playerMove, null, this.engine.board);
      this.currentSolutionIdx++;
      if (this.currentSolutionIdx >= this.solutionMoves.length) {
        this.onPuzzleSolved();
      } else {
        this.setFeedback('✅ Doğru hamle! Devam edin...', 'success');
      }
    } else {
      this.onWrongMove(playerMove);
    }
  }

  onPuzzleSolved() {
    this.solved = true;
    this.saveProgress(this.currentPuzzle.id);
    this.setFeedback('🎉 Mükemmel! Bulmacayı çözdünüz!', 'success');
    this.showFireworks();
    this.renderPuzzleList(); // Update badges
  }

  onWrongMove(move) {
    this.setFeedback('❌ Yanlış hamle! Tekrar deneyin.', 'error');
    // Flash red
    setTimeout(() => {
      this.setFeedback('💡 İpucu için "İpucu Al" butonuna tıklayın.', '');
    }, 1500);
  }

  setFeedback(msg, type = '') {
    const el = document.getElementById('puzzle-feedback');
    if (!el) return;
    el.textContent = msg;
    el.className = 'puzzle-feedback';
    if (type) el.classList.add('feedback-' + type);
  }

  showHint() {
    const hint = document.getElementById('puzzle-hint-text');
    if (hint) {
      hint.textContent = '💡 ' + (this.currentPuzzle?.hint || 'İki kez düşün!');
      hint.classList.remove('hidden');
    }
  }

  showSolution() {
    const sol = document.getElementById('puzzle-solution-text');
    if (sol) {
      sol.textContent = '✓ Çözüm: ' + (this.currentPuzzle?.solutionText || '?');
      sol.classList.remove('hidden');
    }
    // Apply solution automatically
    this.solutionMoves.forEach((move, i) => {
      setTimeout(() => {
        if (this.engine.turn !== this.engine.board[move.fromRow]?.[move.fromCol]?.color) return;
        const m = {...move};
        this.engine.makeMove(m);
        this.renderer.lastMove = m;
        this.renderer.render(this.engine.board);
      }, i * 800 + 200);
    });
    setTimeout(() => this.onPuzzleSolved(), this.solutionMoves.length * 800 + 400);
  }

  resetPuzzle() {
    if (this.currentPuzzle) this.loadPuzzle(this.currentPuzzle.id);
  }

  showFireworks() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'block';
    for (let i = 0; i < 30; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark';
      spark.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
        background:hsl(${Math.random()*360},100%,60%);
        animation-delay:${Math.random()*0.5}s;
        animation-duration:${0.5 + Math.random()}s`;
      container.appendChild(spark);
    }
    setTimeout(() => {
      container.style.display = 'none';
      container.innerHTML = '';
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.challengesMgr = new ChallengesManager();
  document.getElementById('btn-hint')?.addEventListener('click', () => challengesMgr.showHint());
  document.getElementById('btn-solution')?.addEventListener('click', () => challengesMgr.showSolution());
  document.getElementById('btn-reset-puzzle')?.addEventListener('click', () => challengesMgr.resetPuzzle());
});
