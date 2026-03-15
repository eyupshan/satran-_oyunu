// board.js — Chess Board Renderer with Modern SVG Pieces

// ============ SVG PIECE DEFINITIONS ============
const PIECE_SVGS = {
  wK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <defs><filter id="ws"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/></filter></defs>
    <g filter="url(#ws)" fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5"/>
      <path d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M12.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-4-6-7.5c0 0-1 5 5 7.5v10c-2.5-7.5-12-10.5-16-4-3 6 5 10 5 10z"/>
      <path d="M12.5 30c5.5-3 15.5-3 21 0M12.5 33.5c5.5-3 15.5-3 21 0"/>
    </g>
  </svg>`,
  bK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <defs><filter id="bs"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.6"/></filter></defs>
    <g filter="url(#bs)" fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5"/>
      <path d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M12.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-4-6-7.5c0 0-1 5 5 7.5v10c-2.5-7.5-12-10.5-16-4-3 6 5 10 5 10z"/>
      <path d="M12.5 30c5.5-3 15.5-3 21 0M12.5 33.5c5.5-3 15.5-3 21 0"/>
    </g>
  </svg>`,
  wQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <defs><filter id="wqs"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/></filter></defs>
    <g filter="url(#wqs)" fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/>
      <circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/>
      <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.4-8.2-13.4L14 25 6.5 13.5 9 26"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4"/>
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
    </g>
  </svg>`,
  bQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/>
      <circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/>
      <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.4-8.2-13.4L14 25 6.5 13.5 9 26"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4"/>
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
    </g>
  </svg>`,
  wR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9zM14 29.5v-13h17v13zM14 16.5L11 14h23l-3 2.5"/>
      <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M14 29.5H9l-2 4h29l-2-4H31"/>
    </g>
  </svg>`,
  bR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9zM14 29.5v-13h17v13zM14 16.5L11 14h23l-3 2.5"/>
      <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M14 29.5H9l-2 4h29l-2-4H31"/>
    </g>
  </svg>`,
  wB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#fff" stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15"/>
    </g>
  </svg>`,
  bB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15"/>
    </g>
  </svg>`,
  wN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 5.1-5.55 7.18-8 9-3 2-7.05 4.17-5 6.5 2.5 2 12.5 2 15 0 .5-1.5-4.5-2-4-4 1-1 5 1 5-3.5"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#1a0033"/>
    </g>
  </svg>`,
  bN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <g fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 5.1-5.55 7.18-8 9-3 2-7.05 4.17-5 6.5 2.5 2 12.5 2 15 0 .5-1.5-4.5-2-4-4 1-1 5 1 5-3.5"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#a78bfa"/>
    </g>
  </svg>`,
  wP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.35 16 20.5c0 2.74 2.33 5 5 5.5V29h-5l-1 2h12l-1-2h-5v-3c2.67-.5 5-2.76 5-5.5 0-2.15-1.33-4-3.28-5.12.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#1a0033" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-1.5c-5.5 2-15.5 2-21 0V37z" fill="#fff" stroke="#1a0033" stroke-width="1.5"/>
  </svg>`,
  bP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.35 16 20.5c0 2.74 2.33 5 5 5.5V29h-5l-1 2h12l-1-2h-5v-3c2.67-.5 5-2.76 5-5.5 0-2.15-1.33-4-3.28-5.12.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-1.5c-5.5 2-15.5 2-21 0V37z" fill="#1a1a2e" stroke="#a78bfa" stroke-width="1.5"/>
  </svg>`
};

// ============ BOARD RENDERER ============
class BoardRenderer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.flipped = options.flipped || false;
    this.selectedSquare = null;
    this.legalMoveTargets = [];
    this.lastMove = null;
    this.onSquareClick = options.onSquareClick || (() => {});
    this.dragData = null;
    this.render(null);
  }

  getDisplayCoords(row, col) {
    return this.flipped ? { r: 7 - row, c: 7 - col } : { r: row, c: col };
  }

  render(board) {
    if (!this.container) return;
    this.container.innerHTML = '';
    const files = this.flipped ? 'hgfedcba' : 'abcdefgh';
    const ranks = this.flipped ? '12345678' : '87654321';

    for (let dispR = 0; dispR < 8; dispR++) {
      for (let dispC = 0; dispC < 8; dispC++) {
        const row = this.flipped ? 7 - dispR : dispR;
        const col = this.flipped ? 7 - dispC : dispC;

        const sq = document.createElement('div');
        sq.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
        sq.dataset.row = row;
        sq.dataset.col = col;

        // Highlights
        if (this.selectedSquare?.row === row && this.selectedSquare?.col === col)
          sq.classList.add('selected');
        if (this.legalMoveTargets.some(m => m.toRow === row && m.toCol === col))
          sq.classList.add('legal-target');
        if (this.lastMove &&
            ((this.lastMove.fromRow === row && this.lastMove.fromCol === col) ||
             (this.lastMove.toRow === row && this.lastMove.toCol === col)))
          sq.classList.add('last-move');

        // Coordinates
        if (dispC === 0) {
          const rl = document.createElement('span');
          rl.className = 'coord-rank';
          rl.textContent = ranks[dispR];
          sq.appendChild(rl);
        }
        if (dispR === 7) {
          const fl = document.createElement('span');
          fl.className = 'coord-file';
          fl.textContent = files[dispC];
          sq.appendChild(fl);
        }

        // Piece
        if (board) {
          const piece = board[row][col];
          if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'piece';
            pieceEl.innerHTML = PIECE_SVGS[piece.color + piece.type] || '';
            pieceEl.draggable = true;
            pieceEl.dataset.row = row;
            pieceEl.dataset.col = col;
            // Drag events
            pieceEl.addEventListener('dragstart', (e) => this.onDragStart(e, row, col));
            sq.appendChild(pieceEl);
          }
        }

        // Legal move dot for empty squares
        if (this.legalMoveTargets.some(m => m.toRow === row && m.toCol === col)) {
          const dot = document.createElement('div');
          dot.className = board && board[row][col] ? 'capture-ring' : 'move-dot';
          sq.appendChild(dot);
        }

        // Check highlight
        if (board && board[row][col]?.type === 'K') {
          sq.dataset.king = board[row][col].color;
        }

        // Events
        sq.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onSquareClick(row, col);
        });
        sq.addEventListener('dragover', (e) => e.preventDefault());
        sq.addEventListener('drop', (e) => {
          e.preventDefault();
          if (this.dragData) {
            this.onSquareClick(this.dragData.row, this.dragData.col);
            setTimeout(() => this.onSquareClick(row, col), 10);
            this.dragData = null;
          }
        });

        this.container.appendChild(sq);
      }
    }
  }

  onDragStart(e, row, col) {
    this.dragData = { row, col };
    this.onSquareClick(row, col);
    e.dataTransfer.effectAllowed = 'move';
  }

  setHighlights(selectedSquare, legalMoves, lastMove, checkColor, board) {
    this.selectedSquare = selectedSquare;
    this.legalMoveTargets = legalMoves || [];
    this.lastMove = lastMove;

    // Update DOM classes only (no full re-render)
    const squares = this.container.querySelectorAll('.square');
    squares.forEach(sq => {
      const r = parseInt(sq.dataset.row);
      const c = parseInt(sq.dataset.col);
      sq.classList.remove('selected','legal-target','last-move','in-check');

      if (this.selectedSquare?.row === r && this.selectedSquare?.col === c)
        sq.classList.add('selected');
      if (this.legalMoveTargets.some(m => m.toRow === r && m.toCol === c))
        sq.classList.add('legal-target');
      if (this.lastMove &&
          ((this.lastMove.fromRow === r && this.lastMove.fromCol === c) ||
           (this.lastMove.toRow === r && this.lastMove.toCol === c)))
        sq.classList.add('last-move');
      if (checkColor && board?.[r]?.[c]?.type === 'K' && board[r][c].color === checkColor)
        sq.classList.add('in-check');

      // Update dots
      const existingDot = sq.querySelector('.move-dot, .capture-ring');
      if (existingDot) existingDot.remove();
      if (this.legalMoveTargets.some(m => m.toRow === r && m.toCol === c)) {
        const dot = document.createElement('div');
        dot.className = board && board[r][c] ? 'capture-ring' : 'move-dot';
        sq.appendChild(dot);
      }
    });
  }

  flip() {
    this.flipped = !this.flipped;
  }

  // Render captured pieces
  renderCaptured(captures, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const order = ['Q','R','B','N','P'];
    const sorted = [...captures].sort((a,b) => order.indexOf(a.type) - order.indexOf(b.type));
    sorted.forEach(p => {
      const span = document.createElement('span');
      span.className = 'captured-piece';
      span.innerHTML = PIECE_SVGS[p.color + p.type] || '';
      el.appendChild(span);
    });
  }
}
