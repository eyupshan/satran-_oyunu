// learn.js — Interactive Learning Page Logic

const OPENINGS = [
  {
    id: 'sicilian', name: 'Sicilya Savunması', badge: 'Siyah', diff: 'Orta',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    moves: ['1.e4 c5'],
    desc: 'Dünyanın en popüler açılışı. Siyah, merkezi asimetrik biçimde kontrol altına alır. e5\'i engellemek yerine c5 ile vezir kanadında faaliyet planlar. Sicilya savunması son derece geniş bir teori barındırır.',
    tips: ['Siyah, vezir kanadında karşı oyun kurar', 'd5 merkezini hedefler', 'Açık c-sütunu siyaha avantaj sağlar']
  },
  {
    id: 'italian', name: 'İtalyan Oyunu', badge: 'Beyaz', diff: 'Kolay',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['1.e4 e5', '2.Nf3 Nc6', '3.Bc4'],
    desc: 'Tarihin en eski açılışlarından biri. Fil c4\'e konarak f7\'yi tehdit eder ve merkez kontrolü sağlanır. Hızlı rok için ideal bir yapı oluşturur.',
    tips: ['Fil ile f7 karesi baskı altında', 'Hızlı gelişim önceliklidir', 'Merkez piyonları güçlü konumdadır']
  },
  {
    id: 'french', name: 'Fransız Savunması', badge: 'Siyah', diff: 'Orta',
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3',
    moves: ['1.e4 e6', '2.d4 d5'],
    desc: 'Siyah, e6 ile sağlam bir piyon zinciri kurar. d5 baskısıyla beyazın merkezine meydan okur. Beyaz için e5 ilerlemesi önemli bir stratejidir.',
    tips: ['Siyah için kara-kareli fil sorunludur', 'd5 squa kontrolü kritik', 'Kapalı oyun stratejisi ağır basar']
  },
  {
    id: 'kings-indian', name: 'Kral\'s Hint Savunması', badge: 'Siyah', diff: 'Zor',
    fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 5 6',
    moves: ['1.d4 Nf6', '2.c4 g6', '3.Nc3 Bg7', '4.e4 d6', '5.Nf3 0-0'],
    desc: 'Siyah beyaza geniş bir merkez vererek karşı saldırı planlar. Kral kanadında patlayıcı saldırılar mümkündür. Modern satrancın en dinamik açılışlarından biri.',
    tips: ['e5 veya c5 piyon kırılması planlanır', 'Fianchetto fil g2\'yi kontrol eder', 'Kral kanadı saldırısı f5-g4 ile gelir']
  },
  {
    id: 'queens-gambit', name: 'Vezir Gambiti', badge: 'Beyaz', diff: 'Orta',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    moves: ['1.d4 d5', '2.c4'],
    desc: 'Beyaz, c4 ile piyonunu teklif eder. Amaç merkezi genişletmek ve siyahın d5\'ini geri çektirmektir. Klasik ve güçlü bir açılış sistemidir.',
    tips: ['c4xd5 alınırsa e4 ile merkez genişler', 'Siyah kabul ederse piyon geri kazanılabilir', 'Vezir kanadı açılışlarının temeli']
  },
  {
    id: 'london', name: 'Londra Sistemi', badge: 'Beyaz', diff: 'Kolay',
    fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 2 3',
    moves: ['1.d4 d5', '2.Nf3 Nf6', '3.Bf4'],
    desc: 'Sağlam ve öğrenmesi kolay bir beyaz sistemi. Fil f4\'e erken konarak güçlü bir yapı oluşturulur. Geniş teorik bilgi gerektirmez, pratik seçenekler sunar.',
    tips: ['Katı ama sağlam bir yapı', 'e3-Bd3-0-0 gelişim planı', 'Az riskli ve güvenilir']
  },
  {
    id: 'ruy-lopez', name: 'Ruy Lopez (İspanyol)', badge: 'Beyaz', diff: 'Zor',
    fen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    moves: ['1.e4 e5', '2.Nf3 Nc6', '3.Bb5'],
    desc: 'En köklü ve derin açılışlardan biri. Fil b5\'e sürerek c6 atı üzerine baskı oluşturur ve e5 piyonunu dolaylı tehdit eder. Yüzyıllarca analiz edilmiştir.',
    tips: ['Siyah a6 ile atı savunur', 'Açık Ruy Lopez ve Kapalı Ruy Lopez varyantları var', 'Uzun vadeli avantaj aranır']
  }
];

const STRATEGIES = [
  { icon: '♟', title: 'Piyon Yapısı', content: 'Geri piyon, izole piyon ve çiftlenmiş piyon zayıflıkları kaçınılmalıdır. Geçmiş piyon (passed pawn) güçlü bir avantajdır; rakip tarafından durdurulamaz. Piyon adaları azaltılmalı, bağlantılı piyonlar korunmalıdır. Merkez piyonları (d4/e4 veya d5/e5) en değerli piyonlardır.' },
  { icon: '👑', title: 'Kral Güvenliği', content: 'Rok yapmak kral güvenliğinin temelidir. Rok sonrası kral önündeki piyonları hareket ettirmekten kaçının. Açık diagonaller ve sütunlar kral için tehlikeli olabilir. Rok yapılmamış bir kral oyun ortasında büyük bir zayıflıktır.' },
  { icon: '🎯', title: 'Taş Aktivitesi', content: 'Pasif taşlar oyunu kaybettirir. Her taşı en iyi kareye yerleştirin. Atlar merkezde en güçlü konumdadır (c3/f3 veya c6/f6). Filler açık diyagonallerde parlar. Kaleler açık ya da yarı açık sütunlarda en etkilidir.' },
  { icon: '⚡', title: 'Merkez Kontrolü', content: 'Merkez kareler (d4/e4/d5/e5) tüm taşların hareket alanını belirler. Merkezi kontrol eden oyuncu daha fazla seçenek ve alan avantajı sağlar. Hem piyon hem de taşlarla merkez kontrolü kurulabilir.' },
  { icon: '🔓', title: 'Açık Sütunlar', content: 'Kaleler açık (piyon bulunmayan) veya yarı açık sütunlara yerleştirilmelidir. 7. ya da 8. sıraya giren kale büyük baskı oluşturur. İki kale birbirini desteklediğinde "domuzu ikiye biçmek" (pig on 7th) taktiği uygulanabilir.' },
  { icon: '🏰', title: 'Zayıf Kareler', content: 'Piyonun bir daha ulaşamayacağı kareler "zayıf kare" olarak adlandırılır. Bu karelere at veya fil yerleştirmek güçlü bir stratejidir. Özellikle d6/e6 veya d3/e3 kareleri kritik olabilir.' }
];

const MIDDLEGAME = [
  { name: 'Çatal (Fork)', icon: '⚔️', desc: 'Bir taş aynı anda iki ya da daha fazla rakip taşı tehdit eder. En etkili çatallar at ile yapılır çünkü at L-şeklinde hareket eder ve engellenmesi zordur. Kral ve veziri aynı anda tehdit eden çatal "family fork" olarak bilinir.', example: 'At e5\'te: d7 veziri ve f7 filini aynı anda tehdit eder.' },
  { name: 'İğne (Pin)', icon: '📌', desc: 'Bir yüksek değerli taşın arkasında başka bir taş olduğunda, öndeki taş hareket edemez. Mutlak iğne: öndeki taş hareket ederse kral açıkta kalır (yasa aykırı). Göreceli iğne: öndeki taş hareket ederse daha değerli bir taş kaybolur.', example: 'Fil g5\'te: f6 atını vezir d8\'e karşı iğneler.' },
  { name: 'Çapraz Atlatma (Skewer)', icon: '🗡️', desc: 'İğnenin tersi: önde değerli taş, arkada daha az değerli taş bulunur. Değerli taş kaçınca arkasındaki taş kaybedilir. Genellikle fil veya vezir ile uygulanır.', example: 'Kale a1\'de: a8\'deki veziri ve a7\'deki kaleyi tehdit eder.' },
  { name: 'Gizli Hamle (Discovered Attack)', icon: '👁️', desc: 'Bir taş hareket ederek arkasındaki taşın saldırısını ortaya çıkarır. Çifte tehdit oluşturduğu için savunması çok zordur. Keşfedilen şah özellikle güçlüdür.', example: 'At f3\'ten hareket eder, arkasındaki fil c2\'den e4\'ü tehdit eder.' },
  { name: 'Çifte Şah (Double Check)', icon: '⚡', desc: 'İki taş aynı anda şah verir. Sadece kral hareketiyle savunulabilir. En zorlu taktiklerden biridir.', example: 'Keşfedilen şah ile hem at hem de kale aynı anda şah verir.' },
  { name: 'Taktik Fedakarlık', icon: '💎', desc: 'Daha büyük bir kazanım için bir taşı kasıtlı olarak feda etme. Pozisyonel üstünlük, mat saldırısı veya taş geri kazanımı için kullanılabilir.', example: 'Be6 fxe6, sonra Qh5+ ile mat saldırısı başlar.' }
];

const ENDGAME = [
  { name: 'Kral Aktivasyonu', icon: '♔', desc: 'Son oyunda kral güçlü bir savaş taşına dönüşür. Aktif kral gereksiz piyonları alabilir ve yürüyüşleri destekleyebilir. Kral genellikle merkeze ya da geçmiş piyonun önüne yönlendirilmelidir.' },
  { name: 'Geçmiş Piyonlar', icon: '⬆️', desc: 'Karşı tarafa ulaşabilen piyonlar son oyunun en önemli avantajıdır. Kral eşlik ederek piyon yürüyüşünü destekler. Rakip kral geçmiş piyonu durdurmaya çalışır.' },
  { name: 'Muhalefet (Opposition)', icon: '🔄', desc: 'İki kral karşılıklı durduğunda aralarındaki ilişki "muhalefet"tir. Muhalefetin sahip olan kral rakibin geçmesini engelleyebilir. Piyon-kral son oyunlarında kritik bir kavramdır.' },
  { name: 'Kale+Piyon Son Oyunu', icon: '🏰', desc: 'En sık karşılaşılan son oyun türüdür. Lucena ve Philidor pozisyonları bilinmesi gereken temel unsurlardır. Aktif kale karşı kaleyi pasif tutmaya zorlamalıdır.' },
  { name: 'Lucena Pozisyonu', icon: '🏆', desc: '"Köprü yapma" tekniğiyle piyonu terfi ettirme yöntemi. Kale, kral yolunu açmak için basamak görevi görür. Temel son oyun tekniklerinden biridir.', example: '1.Rd1+ Kc7 2.Rd4 ... köprü' },
  { name: 'Philidor Pozisyonu', icon: '🛡️', desc: 'Savunan taraf için temel beraberlik tekniği. Kale 3. sırada tutularak piyon ilerlediğinde kral kanadına geçilir. Pasif kale son sırada kalabilir.', example: '1...Ra6! 2.e6 Ra1 3.Kf7 Rf1+' }
];

// ============ MINI BOARD ============
function renderMiniBoard(fen, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const tmpEngine = new ChessEngine();
  tmpEngine.loadFEN(fen);
  const board = tmpEngine.board;
  container.innerHTML = '';
  container.className = 'mini-board';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.className = 'mini-square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      const piece = board[r][c];
      if (piece && typeof PIECE_SVGS !== 'undefined') {
        const pd = document.createElement('div');
        pd.className = 'mini-piece';
        pd.innerHTML = PIECE_SVGS[piece.color + piece.type] || '';
        sq.appendChild(pd);
      }
      container.appendChild(sq);
    }
  }
}

// ============ TABS ============
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabGroup = btn.dataset.tabGroup;
      const tabId = btn.dataset.tab;
      document.querySelectorAll(`[data-tab-group="${tabGroup}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[data-tab-content-group="${tabGroup}"]`).forEach(c => c.classList.remove('active'));
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

// ============ RENDER OPENINGS ============
function renderOpenings() {
  const container = document.getElementById('openings-list');
  if (!container) return;
  container.innerHTML = '';
  OPENINGS.forEach((op, i) => {
    const card = document.createElement('div');
    card.className = 'learn-card';
    card.innerHTML = `
      <div class="learn-card-top">
        <div id="mini-board-${i}" class="mini-board"></div>
        <div class="learn-card-info">
          <div class="learn-card-header">
            <h3>${op.name}</h3>
            <div style="display:flex;gap:6px;margin-top:6px">
              <span class="badge badge-purple">${op.badge}</span>
              <span class="badge badge-gold">${op.diff}</span>
            </div>
          </div>
          <div class="learn-moves">${op.moves.map(m => `<code class="move-code">${m}</code>`).join('')}</div>
          <p class="learn-desc">${op.desc}</p>
          <ul class="learn-tips">${op.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
    `;
    container.appendChild(card);
    setTimeout(() => renderMiniBoard(op.fen, `mini-board-${i}`), 100);
  });
}

function renderStrategies() {
  const container = document.getElementById('strategies-list');
  if (!container) return;
  container.innerHTML = '';
  STRATEGIES.forEach(s => {
    const card = document.createElement('div');
    card.className = 'strategy-card card';
    card.innerHTML = `
      <div class="strategy-icon">${s.icon}</div>
      <h3 class="strategy-title">${s.title}</h3>
      <p class="strategy-desc">${s.content}</p>
    `;
    container.appendChild(card);
  });
}

function renderMiddlegame() {
  const container = document.getElementById('middlegame-list');
  if (!container) return;
  container.innerHTML = '';
  MIDDLEGAME.forEach(m => {
    const card = document.createElement('div');
    card.className = 'tactic-card card';
    card.innerHTML = `
      <div class="tactic-header">
        <span class="tactic-icon">${m.icon}</span>
        <h3>${m.name}</h3>
      </div>
      <p style="color:var(--text-secondary);margin:0.8rem 0;line-height:1.7">${m.desc}</p>
      ${m.example ? `<div class="tactic-example"><span style="color:var(--gold);font-weight:600">Örnek:</span> ${m.example}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

function renderEndgame() {
  const container = document.getElementById('endgame-list');
  if (!container) return;
  container.innerHTML = '';
  ENDGAME.forEach(e => {
    const card = document.createElement('div');
    card.className = 'endgame-card card';
    card.innerHTML = `
      <div class="endgame-header">
        <span class="endgame-icon">${e.icon}</span>
        <h3>${e.name}</h3>
      </div>
      <p style="color:var(--text-secondary);margin:0.8rem 0;line-height:1.7">${e.desc}</p>
      ${e.example ? `<div class="tactic-example"><span style="color:var(--success);font-weight:600">Örnek:</span> ${e.example}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderOpenings();
  renderStrategies();
  renderMiddlegame();
  renderEndgame();
});
