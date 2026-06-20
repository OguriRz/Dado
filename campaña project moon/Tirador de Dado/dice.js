  // ============================================================
  //  DICE ROLLER
  // ============================================================

  const DICE_COLORS = {
    4:   '#c0392b',
    6:   '#2980b9',
    8:   '#27ae60',
    10:  '#8e44ad',
    12:  '#d4a017',
    20:  '#16a085',
    25:  '#16a085',
    50:  '#b8860b',
    100: '#00a885',
  };

  function getDieColor(sides) {
    return DICE_COLORS[sides] || '#d4a245';
  }

  let pool = [];
  let isRolling = false;
  let rollHistory = [];
  let lastRollTotal = null;
  let lastRawTotal = null;
  let lastRawFormula = '';

  const diceTypeBtns = document.querySelectorAll('.dice-type-btn');
  const diceCountInput = document.getElementById('diceCount');
  const bonusInput = document.getElementById('bonus');
  const rollBtn = document.getElementById('rollBtn');
  const clearPoolBtn = document.getElementById('clearPoolBtn');
  const poolEmpty = document.getElementById('poolEmpty');
  const poolChips = document.getElementById('poolChips');
  const resultTotal = document.getElementById('resultTotal');
  const resultFormula = document.getElementById('resultFormula');
  const diceVisuals = document.getElementById('diceVisuals');
  const lastRollTag = document.getElementById('lastRollTag');
  const diceTotalLabel = document.getElementById('diceTotalLabel');

  function addToPool(sides) {
    const count = Math.max(1, parseInt(diceCountInput.value) || 1);
    const existing = pool.find(p => p.sides === sides);
    if (existing) { existing.count += count; }
    else { pool.push({ sides, count }); }
    renderPool();
    updateRollButton();
  }

  function removeFromPool(sides) {
    const existing = pool.find(p => p.sides === sides);
    if (!existing) return;
    existing.count--;
    if (existing.count <= 0) pool = pool.filter(p => p.sides !== sides);
    renderPool();
    updateRollButton();
    saveState();
  }

  function clearPool() {
    pool = [];
    renderPool();
    updateRollButton();
    resultTotal.textContent = '—';
    resultFormula.textContent = 'Pool vacío';
    diceVisuals.innerHTML = '';
    diceTotalLabel.textContent = '0 dados';
    document.getElementById('sendToCompare').style.display = 'none';
    lastRollTotal = null;
    lastRawTotal = null;
    lastRawFormula = '';
    saveState();
  }

  function getTotalDiceCount() {
    return pool.reduce((sum, p) => sum + p.count, 0);
  }

  function renderPool() {
    const container = poolChips;
    const total = getTotalDiceCount();
    if (total === 0) {
      poolEmpty.style.display = 'block';
      container.style.display = 'none';
      clearPoolBtn.style.display = 'none';
      diceTotalLabel.textContent = '0 dados';
      return;
    }
    poolEmpty.style.display = 'none';
    container.style.display = 'flex';
    container.innerHTML = '';
    pool.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'pool-chip';
      const color = getDieColor(item.sides);
      const countSpan = document.createElement('span');
      countSpan.className = 'pool-count';
      countSpan.style.color = color;
      countSpan.textContent = item.count;
      const label = document.createTextNode('D' + item.sides);
      const rmBtn = document.createElement('button');
      rmBtn.className = 'pool-remove';
      rmBtn.textContent = '✕';
      rmBtn.title = 'Quitar uno';
      rmBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFromPool(item.sides); });
      chip.appendChild(countSpan);
      chip.appendChild(label);
      chip.appendChild(rmBtn);
      chip.addEventListener('click', () => { pool.find(p => p.sides === item.sides).count++; renderPool(); updateRollButton(); saveState(); });
      container.appendChild(chip);
    });
    clearPoolBtn.style.display = 'inline-block';
    diceTotalLabel.textContent = total + ' dado' + (total !== 1 ? 's' : '');
  }

  function updateRollButton() {
    rollBtn.disabled = getTotalDiceCount() === 0 || isRolling;
  }

  diceTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => { addToPool(parseInt(btn.dataset.sides)); saveState(); });
  });
  clearPoolBtn.addEventListener('click', clearPool);

  function buildDieShape(sides, size) {
    const h = size / 2;
    const r = size / 2 - 4;
    if (sides === 6) return { type: 'rect', rx: 7, w: size - 2, h: size - 2 };
    if (sides === 4) return { type: 'polygon', pts: `${h},5 6,${size-5} ${size-6},${size-5}` };
    if (sides === 8) return { type: 'polygon', pts: `${h},5 ${size-5},${h} ${h},${size-5} 5,${h}` };
    if (sides === 10) {
      const pts = [];
      for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; pts.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
      return { type: 'polygon', pts: pts.join(' ') };
    }
    if (sides === 12) {
      const pts = [];
      for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * Math.PI / 180; pts.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
      return { type: 'polygon', pts: pts.join(' ') };
    }
    if (sides === 20) {
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = (i * 60 - 90) * Math.PI / 180; pts.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
      return { type: 'polygon', pts: pts.join(' ') };
    }
    if (sides === 25) {
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = (i * 60 - 90) * Math.PI / 180; pts.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
      return { type: 'polygon', pts: pts.join(' ') };
    }
    if (sides === 50) {
      const pts = [];
      for (let i = 0; i < 8; i++) { const a = (i * 45 - 90) * Math.PI / 180; pts.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
      return { type: 'polygon', pts: pts.join(' ') };
    }
    if (sides === 100) return { type: 'circle', cx: h, cy: h, r: h - 3 };
    return { type: 'rect', rx: 7, w: size - 2, h: size - 2 };
  }

  function createDieSVG(val, sides, rolling) {
    const size = 44;
    const h = size / 2;
    let fillColor, strokeColor, textColor, textStr;
    if (rolling) {
      const c = getDieColor(sides);
      fillColor = c + '18'; strokeColor = c + '60'; textColor = c + '99'; textStr = '?';
    } else {
      const crit = val === sides;
      const fail = val === 1 && (sides === 20 || sides === 100);
      const c = getDieColor(sides);
      if (crit) { fillColor = 'rgba(74,154,90,0.08)'; strokeColor = '#4a9a5a'; textColor = '#4a9a5a'; }
      else if (fail) { fillColor = 'rgba(192,57,43,0.08)'; strokeColor = '#c0392b'; textColor = '#c0392b'; }
      else { fillColor = c + '18'; strokeColor = c; textColor = '#d4c8b0'; }
      textStr = String(val);
    }
    const shape = buildDieShape(sides, size);
    const fontSize = sides >= 50 ? 12 : sides >= 25 ? 13 : 15;
    let shapeEl = '';
    if (shape.type === 'rect') shapeEl = `<rect x="1" y="1" width="${shape.w}" height="${shape.h}" rx="${shape.rx}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>`;
    else if (shape.type === 'circle') shapeEl = `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>`;
    else if (shape.type === 'polygon') shapeEl = `<polygon points="${shape.pts}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round"/>`;
    let innerEl = '';
    if (sides === 6 && !rolling) {
      const dotR = 3; const d = 9;
      const positions = {
        1: [[h, h]], 2: [[h-d, h-d], [h+d, h+d]],
        3: [[h-d, h-d], [h, h], [h+d, h+d]],
        4: [[h-d, h-d], [h+d, h-d], [h-d, h+d], [h+d, h+d]],
        5: [[h-d, h-d], [h+d, h-d], [h, h], [h-d, h+d], [h+d, h+d]],
        6: [[h-d, h-d], [h+d, h-d], [h-d, h], [h+d, h], [h-d, h+d], [h+d, h+d]]
      };
      innerEl = (positions[val] || positions[1]).map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="${dotR}" fill="${textColor}"/>`).join('');
    } else {
      const actualY = sides === 4 ? size - 9 : h + 5;
      innerEl = `<text x="${h}" y="${actualY}" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700">${textStr}</text>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeEl}${innerEl}</svg>`;
  }

  function renderDiceVisuals(results, sidesList, rolling) {
    diceVisuals.innerHTML = '';
    if (!results || results.length === 0) { diceVisuals.innerHTML = '<span class="empty-msg">Tirá los dados</span>'; return; }
    const toShow = Math.min(results.length, 40);
    for (let i = 0; i < toShow; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'die-visual';
      if (rolling) wrapper.classList.add('tumble');
      wrapper.innerHTML = createDieSVG(results[i], sidesList[i], rolling);
      diceVisuals.appendChild(wrapper);
    }
    if (results.length > 40) {
      const more = document.createElement('div');
      more.style.cssText = `color:var(--inv-text4);font-size:12px;display:flex;align-items:center`;
      more.textContent = '+' + (results.length - 40);
      diceVisuals.appendChild(more);
    }
  }

  function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }

  function doRoll() {
    if (isRolling) return;
    const totalDice = getTotalDiceCount();
    if (totalDice === 0) return;
    isRolling = true;
    rollBtn.disabled = true;
    rollBtn.classList.add('rolling');
    rollBtn.textContent = '🎲 RODANDO';
    const bonus = parseInt(bonusInput.value) || 0;
    const allSides = [];
    pool.forEach(item => { for (let i = 0; i < item.count; i++) allSides.push(item.sides); });
    const realResults = allSides.map(s => rollDie(s));
    const realSum = realResults.reduce((a, b) => a + b, 0);
    lastRawTotal = realSum + bonus;
    let realTotal = lastRawTotal;
    if (activeStatuses.has('paralysis')) {
      realTotal = Math.floor(realTotal / 2);
    }
    if (activeStatuses.has('power')) {
      realTotal += 5;
    }
    if (activeStatuses.has('weakness')) {
      realTotal -= 5;
    }
    for (let i = realResults.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [realResults[i], realResults[j]] = [realResults[j], realResults[i]]; [allSides[i], allSides[j]] = [allSides[j], allSides[i]]; }      resultTotal.textContent = '?';
    resultTotal.classList.add('loading');
    resultFormula.textContent = 'Tirando ' + totalDice + ' dado' + (totalDice !== 1 ? 's' : '') + '...';
    lastRawTotal = null;
    lastRawFormula = '';
    const blankResults = allSides.map(() => 1);
    renderDiceVisuals(blankResults, allSides, true);
    document.querySelectorAll('.die-visual').forEach(el => { el.style.animationDuration = (0.7 + Math.random() * 0.6) + 's'; });
    const revealDelay = 1100 + Math.random() * 400;
    setTimeout(() => {
      resultTotal.classList.remove('loading');
      resultTotal.textContent = realTotal;
      renderDiceVisuals(realResults, allSides, false);
      const grouped = {};
      allSides.forEach((s, i) => { if (!grouped[s]) grouped[s] = []; if (i < 20) grouped[s].push(realResults[i]); });
      lastRawFormula = '';
      Object.keys(grouped).forEach(s => { if (lastRawFormula) lastRawFormula += ' + '; lastRawFormula += '(' + grouped[s].join(' + ') + ')'; });
      if (allSides.length > 20) lastRawFormula += ' + ...';
      if (bonus > 0) lastRawFormula += ' + ' + bonus;
      lastRawTotal = realSum + bonus;
      var formulaParts = [];
      if (activeStatuses.has('paralysis')) formulaParts.push('½');
      formulaParts.push('(' + lastRawFormula + ')');
      if (activeStatuses.has('power')) formulaParts.push('+5');
      if (activeStatuses.has('weakness')) formulaParts.push('-5');
      resultFormula.textContent = formulaParts.join(' ') + ' = ' + realTotal;
      const idx = rollHistory.length + 1;
      rollHistory.push({ results: realResults, allSides, sum: realSum, bonus, total: realTotal });
      lastRollTag.textContent = '#' + idx + ': ' + realTotal;
      lastRollTotal = realTotal;
      document.getElementById('sendToCompare').style.display = 'flex';
      isRolling = false;
      rollBtn.classList.remove('rolling');
      rollBtn.textContent = '🎲 TIRAR';
      updateRollButton();
      saveState();
    }, revealDelay);
  }

  rollBtn.addEventListener('click', doRoll);
  document.addEventListener('keydown', (e) => {
    if (!panels.dice.classList.contains('active')) return;
    if (e.key === 'Enter' && !isRolling) doRoll();
  });
  document.querySelectorAll('input').forEach(inp => { inp.addEventListener('focus', () => inp.select()); });

  // Auto-save bonus on change
  bonusInput.addEventListener('input', () => saveState());
