const fs = require('fs');
const path = 'campaña project moon/Tirador de Dado/index.html';
let c = fs.readFileSync(path, 'utf8');
let ch = 0;

function insertBefore(marker, text) {
  const idx = c.indexOf(marker);
  if (idx < 0) { console.log('NOT FOUND:', marker.substring(0, 50)); return false; }
  c = c.substring(0, idx) + text + c.substring(idx);
  ch++;
  return true;
}

function replaceOnce(oldStr, newStr) {
  if (!c.includes(oldStr)) { console.log('NOT FOUND:', oldStr.substring(0, 50)); return false; }
  c = c.replace(oldStr, newStr);
  ch++;
  return true;
}

// ============================================================
// 1. CSS for the ruleta
// ============================================================
const ruletaCSS = `
  /* ============================================================
     TAB: RULETA (Spin Wheel)
     ============================================================ */
  .ruleta-layout {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ruleta-options-area {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ruleta-add-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .ruleta-add-row input[type="text"] {
    flex: 1;
    padding: 8px 10px;
    background: var(--inv-input);
    border: 1px solid var(--inv-gold-dim);
    border-radius: 4px;
    color: var(--inv-text);
    font-size: 13px;
    outline: none;
    font-family: 'AritaBuri', 'Rajdhani', Arial, sans-serif;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .ruleta-add-row input[type="text"]:focus {
    border-color: var(--inv-cyan);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 8px var(--inv-cyan-glow);
  }

  .ruleta-add-row input[type="number"] {
    width: 60px;
    padding: 8px 6px;
    background: var(--inv-input);
    border: 1px solid var(--inv-gold-dim);
    border-radius: 4px;
    color: var(--inv-text);
    font-size: 13px;
    font-weight: 600;
    outline: none;
    text-align: center;
    font-family: 'AritaBuri', 'Rajdhani', Arial, sans-serif;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .ruleta-add-row input[type="number"]:focus {
    border-color: var(--inv-cyan);
  }

  .ruleta-add-row .weight-label {
    font-size: 10px;
    color: var(--inv-text4);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'AritaBuri', 'Rajdhani', Arial, sans-serif;
    white-space: nowrap;
  }

  .ruleta-option-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 32px;
    padding: 6px;
    background: var(--inv-parchment);
    border: 1px solid var(--inv-gold-dim);
    border-radius: 4px;
  }

  .ruleta-option-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px 3px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #1a0e00;
    font-family: 'AritaBuri', 'Rajdhani', Arial, sans-serif;
    position: relative;
  }

  .ruleta-option-chip .opt-name {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ruleta-option-chip .opt-weight {
    font-size: 10px;
    opacity: 0.7;
  }

  .ruleta-option-chip .opt-remove {
    width: 16px;
    height: 16px;
    background: rgba(0,0,0,0.2);
    border: none;
    color: rgba(0,0,0,0.4);
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    padding: 0;
    line-height: 1;
  }

  .ruleta-option-chip .opt-remove:hover {
    background: rgba(0,0,0,0.4);
    color: #000;
  }

  .ruleta-canvas-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
    position: relative;
  }

  .ruleta-canvas-wrap canvas {
    max-width: 100%;
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(212, 162, 69, 0.15), 0 0 6px rgba(212, 162, 69, 0.1);
    display: block;
  }

  .ruleta-arrow {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    z-index: 5;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    line-height: 1;
    pointer-events: none;
  }

  .ruleta-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .ruleta-result {
    text-align: center;
    min-height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ruleta-result .winner-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--inv-gold);
    font-family: 'Playfair Display', Georgia, serif;
    text-shadow: 0 0 20px rgba(212, 162, 69, 0.3);
  }

  .ruleta-result .winner-detail {
    font-size: 12px;
    color: var(--inv-text4);
    font-family: 'AritaBuri', 'Rajdhani', Arial, sans-serif;
    margin-top: 2px;
  }

  .ruleta-empty {
    color: var(--inv-text4);
    font-size: 13px;
    text-align: center;
    width: 100%;
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
  }
`;

// Insert CSS before the closing </style> tag
const styleEnd = '</style>';
if (c.includes(styleEnd)) {
  c = c.replace(styleEnd, ruletaCSS + '\r\n</style>');
  ch++;
  console.log('1. Ruleta CSS added');
} else console.log('1. FAIL: </style>');

// ============================================================
// 2. Add tab button after Comparar
// ============================================================
const tabBtn = '    <button class="tab-btn" data-tab="ruleta">\u{1F3B0} Ruleta</button>\r\n  </div>\r\n\r\n  <div class="section-divider"></div>';
const tabMarker = '  </div>\r\n\r\n  <div class="section-divider"></div>\r\n\r\n  <!-- ============ COINS TRACKER';
if (c.includes(tabMarker)) {
  c = c.replace(tabMarker, tabBtn + tabMarker.substring(tabMarker.indexOf('  </div>')));
  // Actually this is wrong. Let me insert after the compare tab button instead.
  // Roll back and do it properly
}

// Actually, the right approach is simpler - insert before the closing </div> of .tabs
const tabsClose = '    <button class="tab-btn" data-tab="compare">\u2696\uFE0F Comparar</button>\r\n  </div>';
const tabsNew = '    <button class="tab-btn" data-tab="compare">\u2696\uFE0F Comparar</button>\r\n    <button class="tab-btn" data-tab="ruleta">\u{1F3B0} Ruleta</button>\r\n  </div>';
if (c.includes(tabsClose)) {
  // Need to be more specific - find the closing of tabs div
  // Find last occurrence (the actual tabs div, not in CSS)
  const lastTabsClose = c.lastIndexOf(tabsClose);
  if (lastTabsClose >= 0 && lastTabsClose > 2000) {
    c = c.substring(0, lastTabsClose) + tabsNew + c.substring(lastTabsClose + tabsClose.length);
    ch++;
    console.log('2. Tab button added');
  } else console.log('2. FAIL: could not find tabs close');
} else console.log('2. FAIL: tabs close not found');

// ============================================================
// 3. Add ruleta tab panel HTML after COMPARE panel
// ============================================================
const ruletaHTML =
'  <!-- ============ TAB: RULETA ============ -->\r\n' +
'  <div class="tab-panel" id="tabRuleta">\r\n' +
'    <div class="ruleta-layout">\r\n' +
'      <div class="ruleta-options-area">\r\n' +
'        <div class="ruleta-add-row">\r\n' +
'          <input type="text" id="ruletaOptionInput" placeholder="Opci\u00f3n (ej: Cofre A)" maxlength="30">\r\n' +
'          <span class="weight-label">Peso</span>\r\n' +
'          <input type="number" id="ruletaWeightInput" value="1" min="1" max="100">\r\n' +
'          <button class="btn-enemy-add" id="ruletaAddBtn" style="padding:6px 12px;font-size:12px">+</button>\r\n' +
'        </div>\r\n' +
'        <div class="ruleta-option-list" id="ruletaOptionList">\r\n' +
'          <div class="ruleta-empty" id="ruletaEmpty">Agreg\u00e1 opciones con su peso probabilidad</div>\r\n' +
'        </div>\r\n' +
'      </div>\r\n' +
'\r\n' +
'      <div class="ruleta-canvas-wrap">\r\n' +
'        <div class="ruleta-arrow">\u25BC</div>\r\n' +
'        <canvas id="ruletaCanvas" width="260" height="260"></canvas>\r\n' +
'      </div>\r\n' +
'\r\n' +
'      <div class="ruleta-controls">\r\n' +
'        <button class="btn-roll" id="ruletaSpinBtn" style="margin-bottom:0;flex:1" disabled>\u{1F3B0} GIRAR</button>\r\n' +
'        <button class="btn-clear" id="ruletaClearBtn" style="flex-shrink:0">Limpiar</button>\r\n' +
'      </div>\r\n' +
'\r\n' +
'      <div class="result-box" id="ruletaResultBox" style="min-height:60px;padding:14px">\r\n' +
'        <div class="ruleta-result" id="ruletaResult">\r\n' +
'          <div class="ruleta-result-placeholder" style="color:var(--inv-text4);font-size:13px;font-style:italic">Agreg\u00e1 opciones y gir\u00e1 la ruleta</div>\r\n' +
'        </div>\r\n' +
'      </div>\r\n' +
'    </div>\r\n' +
'  </div>\r\n\r\n';

insertBefore('<!-- ============ TAB: PLAYERS', ruletaHTML);

// Actually wait - we need to insert after the COMPARE panel closing, and the COMPARE panel is the last panel.
// Let me find where the container ends and insert before that.
// The panels are inside the container-inner div. After all panels, there's just the closing </div><!-- /.container-inner --></div><!-- /.container -->.
// Let me insert before the compare tab closes.

// Actually, let me just insert the ruleta panel after the COMPARE tab panel
const compareEnd = '    <div class="section-divider" style="margin-bottom:0"></div>\r\n  </div>\r\n\r\n  </div><!-- /.container-inner -->\r\n</div><!-- /.container -->';
const compareNew = '    <div class="section-divider" style="margin-bottom:0"></div>\r\n  </div>\r\n\r\n' + ruletaHTML + '  </div><!-- /.container-inner -->\r\n</div><!-- /.container -->';
if (c.includes(compareEnd)) {
  c = c.replace(compareEnd, compareNew);
  ch++;
  console.log('3. Ruleta panel HTML added');
} else console.log('3. FAIL: compare end not found');

// ============================================================
// 4. Update panels object
// ============================================================
replaceOnce(
  "players: document.getElementById('tabPlayers'),\r\n    compare: document.getElementById('tabCompare'),",
  "players: document.getElementById('tabPlayers'),\r\n    compare: document.getElementById('tabCompare'),\r\n    ruleta: document.getElementById('tabRuleta'),"
);

// ============================================================
// 5. Update tabLabels
// ============================================================
replaceOnce(
  "players: '\u{1F6E1}\uFE0F Jugadores', compare: '\u2696\uFE0F Comparar'",
  "players: '\u{1F6E1}\uFE0F Jugadores', compare: '\u2696\uFE0F Comparar', ruleta: '\u{1F3B0} Ruleta'"
);

// ============================================================
// 6. Add RULETA JavaScript after COMPARISON section
// ============================================================
const ruletaJS =
'\r\n' +
'  // ============================================================\r\n' +
'  //  RULETA (Spin Wheel)\r\n' +
'  // ============================================================\r\n' +
'\r\n' +
'  const RULETA_COLORS = [\r\n' +
'    "#d4a245", "#c0395a", "#2980b9", "#27ae60", "#8e44ad",\r\n' +
'    "#16a085", "#b8860b", "#e67e22", "#2c3e50", "#7f8c8d",\r\n' +
'    "#1abc9c", "#3498db", "#9b59b6", "#f39c12", "#e74c3c",\r\n' +
'    "#2ecc71", "#3a7ec0", "#d35400", "#6c3483", "#148f77",\r\n' +
'  ];\r\n' +
'\r\n' +
'  let ruletaOptions = [];\r\n' +
'  let ruletaIsSpinning = false;\r\n' +
'  let ruletaAnimFrame = null;\r\n' +
'\r\n' +
'  const ruletaOptInput = document.getElementById(\'ruletaOptionInput\');\r\n' +
'  const ruletaWeightInput = document.getElementById(\'ruletaWeightInput\');\r\n' +
'  const ruletaAddBtn = document.getElementById(\'ruletaAddBtn\');\r\n' +
'  const ruletaOptList = document.getElementById(\'ruletaOptionList\');\r\n' +
'  const ruletaEmpty = document.getElementById(\'ruletaEmpty\');\r\n' +
'  const ruletaCanvas = document.getElementById(\'ruletaCanvas\');\r\n' +
'  const ruletaSpinBtn = document.getElementById(\'ruletaSpinBtn\');\r\n' +
'  const ruletaClearBtn = document.getElementById(\'ruletaClearBtn\');\r\n' +
'  const ruletaResult = document.getElementById(\'ruletaResult\');\r\n' +
'\r\n' +
'  function ruletaAddOption() {\r\n' +
'    const name = ruletaOptInput.value.trim();\r\n' +
'    if (!name) return;\r\n' +
'    const weight = Math.max(1, parseInt(ruletaWeightInput.value) || 1);\r\n' +
'    if (ruletaOptions.some(o => o.name.toLowerCase() === name.toLowerCase())) return;\r\n' +
'    ruletaOptions.push({ name, weight });\r\n' +
'    ruletaOptInput.value = \'\';\r\n' +
'    ruletaOptInput.focus();\r\n' +
'    ruletaRenderOptions();\r\n' +
'    ruletaDrawWheel();\r\n' +
'    ruletaUpdateButton();\r\n' +
'    ruletaClearResult();\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaRemoveOption(index) {\r\n' +
'    ruletaOptions.splice(index, 1);\r\n' +
'    ruletaRenderOptions();\r\n' +
'    ruletaDrawWheel();\r\n' +
'    ruletaUpdateButton();\r\n' +
'    ruletaClearResult();\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaUpdateWeight(index, newWeight) {\r\n' +
'    const w = Math.max(1, parseInt(newWeight) || 1);\r\n' +
'    ruletaOptions[index].weight = w;\r\n' +
'    ruletaDrawWheel();\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaClearAll() {\r\n' +
'    ruletaOptions = [];\r\n' +
'    ruletaRenderOptions();\r\n' +
'    ruletaDrawWheel();\r\n' +
'    ruletaUpdateButton();\r\n' +
'    ruletaClearResult();\r\n' +
'    if (ruletaAnimFrame) { cancelAnimationFrame(ruletaAnimFrame); ruletaAnimFrame = null; }\r\n' +
'    ruletaIsSpinning = false;\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaRenderOptions() {\r\n' +
'    if (ruletaOptions.length === 0) {\r\n' +
'      ruletaOptList.innerHTML = \'<div class="ruleta-empty" id="ruletaEmpty">Agreg\u00e1 opciones con su peso probabilidad</div>\';\r\n' +
'      return;\r\n' +
'    }\r\n' +
'    let html = \'\';\r\n' +
'    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);\r\n' +
'    ruletaOptions.forEach((opt, i) => {\r\n' +
'      const color = RULETA_COLORS[i % RULETA_COLORS.length];\r\n' +
'      const pct = ((opt.weight / totalWeight) * 100).toFixed(1);\r\n' +
'      html += \'<div class="ruleta-option-chip" style="background:\' + color + \'">\' +\r\n' +
'        \'<span class="opt-name">\' + escapeHtml(opt.name) + \'</span>\' +\r\n' +
'        \'<input type="number" class="opt-weight-input" value=\"\' + opt.weight + \'\" min=\"1\" max=\"999\"\' +\r\n' +
'        \' onchange="ruletaUpdateWeight(\' + i + \', this.value)\" style="width:36px;padding:1px 2px;border:none;background:rgba(0,0,0,0.15);border-radius:2px;color:#1a0e00;font-weight:700;font-size:11px;text-align:center;outline:none">\' +\r\n' +
'        \'<span class="opt-weight">(\' + pct + \'%)</span>\' +\r\n' +
'        \'<button class="opt-remove" onclick="ruletaRemoveOption(\' + i + \')\">\u2715</button>\' +\r\n' +
'        \'</div>\';\r\n' +
'    });\r\n' +
'    ruletaOptList.innerHTML = html;\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaDrawWheel() {\r\n' +
'    const ctx = ruletaCanvas.getContext(\'2d\');\r\n' +
'    const w = ruletaCanvas.width;\r\n' +
'    const h = ruletaCanvas.height;\r\n' +
'    const cx = w / 2, cy = h / 2;\r\n' +
'    const r = Math.min(cx, cy) - 4;\r\n' +
'\r\n' +
'    ctx.clearRect(0, 0, w, h);\r\n' +
'\r\n' +
'    if (ruletaOptions.length === 0) {\r\n' +
'      ctx.beginPath();\r\n' +
'      ctx.arc(cx, cy, r, 0, Math.PI * 2);\r\n' +
'      ctx.fillStyle = \'rgba(212,162,69,0.06)\';\r\n' +
'      ctx.fill();\r\n' +
'      ctx.strokeStyle = \'rgba(212,162,69,0.2)\';\r\n' +
'      ctx.lineWidth = 2;\r\n' +
'      ctx.stroke();\r\n' +
'      ctx.fillStyle = \'rgba(212,162,69,0.3)\';\r\n' +
'      ctx.font = \'14px AritaBuri, Rajdhani, Arial\';\r\n' +
'      ctx.textAlign = \'center\';\r\n' +
'      ctx.textBaseline = \'middle\';\r\n' +
'      ctx.fillText(\'Sin opciones\', cx, cy);\r\n' +
'      return;\r\n' +
'    }\r\n' +
'\r\n' +
'    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);\r\n' +
'    let startAngle = 0;\r\n' +
'\r\n' +
'    ruletaOptions.forEach((opt, i) => {\r\n' +
'      const sliceAngle = (opt.weight / totalWeight) * Math.PI * 2;\r\n' +
'      const endAngle = startAngle + sliceAngle;\r\n' +
'      const color = RULETA_COLORS[i % RULETA_COLORS.length];\r\n' +
'\r\n' +
'      // Draw slice\r\n' +
'      ctx.beginPath();\r\n' +
'      ctx.moveTo(cx, cy);\r\n' +
'      ctx.arc(cx, cy, r, startAngle, endAngle);\r\n' +
'      ctx.closePath();\r\n' +
'      ctx.fillStyle = color;\r\n' +
'      ctx.fill();\r\n' +
'      ctx.strokeStyle = \'rgba(0,0,0,0.2)\';\r\n' +
'      ctx.lineWidth = 1;\r\n' +
'      ctx.stroke();\r\n' +
'\r\n' +
'      // Draw label\r\n' +
'      const midAngle = startAngle + sliceAngle / 2;\r\n' +
'      const labelR = r * 0.6;\r\n' +
'      const lx = cx + Math.cos(midAngle) * labelR;\r\n' +
'      const ly = cy + Math.sin(midAngle) * labelR;\r\n' +
'      ctx.save();\r\n' +
'      ctx.translate(lx, ly);\r\n' +
'      ctx.rotate(midAngle);\r\n' +
'      ctx.fillStyle = \'rgba(0,0,0,0.7)\';\r\n' +
'      ctx.font = \'bold 11px AritaBuri, Rajdhani, Arial\';\r\n' +
'      ctx.textAlign = \'right\';\r\n' +
'      ctx.textBaseline = \'middle\';\r\n' +
'      const label = opt.name.length > 10 ? opt.name.substring(0, 9) + \'...\' : opt.name;\r\n' +
'      ctx.fillText(label, 0, 0);\r\n' +
'      ctx.restore();\r\n' +
'\r\n' +
'      startAngle = endAngle;\r\n' +
'    });\r\n' +
'\r\n' +
'    // Center circle\r\n' +
'    ctx.beginPath();\r\n' +
'    ctx.arc(cx, cy, 14, 0, Math.PI * 2);\r\n' +
'    ctx.fillStyle = \'#08080e\';\r\n' +
'    ctx.fill();\r\n' +
'    ctx.strokeStyle = \'rgba(212,162,69,0.3)\';\r\n' +
'    ctx.lineWidth = 2;\r\n' +
'    ctx.stroke();\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaPickWinner() {\r\n' +
'    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);\r\n' +
'    let roll = Math.random() * totalWeight;\r\n' +
'    for (let i = 0; i < ruletaOptions.length; i++) {\r\n' +
'      roll -= ruletaOptions[i].weight;\r\n' +
'      if (roll <= 0) return i;\r\n' +
'    }\r\n' +
'    return ruletaOptions.length - 1;\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaGetAngleForIndex(index) {\r\n' +
'    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);\r\n' +
'    let angle = 0;\r\n' +
'    for (let i = 0; i < index; i++) {\r\n' +
'      angle += (ruletaOptions[i].weight / totalWeight) * Math.PI * 2;\r\n' +
'    }\r\n' +
'    // Add half the slice so the arrow points at the center of the winning slice\r\n' +
'    angle += (ruletaOptions[index].weight / totalWeight) * Math.PI;\r\n' +
'    return angle;\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaSpin() {\r\n' +
'    if (ruletaIsSpinning || ruletaOptions.length === 0) return;\r\n' +
'    ruletaIsSpinning = true;\r\n' +
'    ruletaSpinBtn.disabled = true;\r\n' +
'    ruletaSpinBtn.textContent = \'\u{1F3B0} GIRANDO...\';\r\n' +
'    ruletaResult.innerHTML = \'<div style=\"color:var(--inv-text4);font-style:italic\">Girando...</div>\';\r\n' +
'\r\n' +
'    const winnerIndex = ruletaPickWinner();\r\n' +
'    const targetAngle = ruletaGetAngleForIndex(winnerIndex);\r\n' +
'    const extraSpins = 4 + Math.floor(Math.random() * 3); // 4-6 full rotations\r\n' +
'    const totalRotation = extraSpins * Math.PI * 2 + (Math.PI * 2 - targetAngle);\r\n' +
'\r\n' +
'    const startRotation = 0;\r\n' +
'    const duration = 3000 + Math.random() * 1000; // 3-4 seconds\r\n' +
'    const startTime = performance.now();\r\n' +
'\r\n' +
'    function easeOutCubic(t) {\r\n' +
'      return 1 - Math.pow(1 - t, 3);\r\n' +
'    }\r\n' +
'\r\n' +
'    const ctx = ruletaCanvas.getContext(\'2d\');\r\n' +
'    const w = ruletaCanvas.width, h = ruletaCanvas.height;\r\n' +
'    const cx = w / 2, cy = h / 2;\r\n' +
'    const r = Math.min(cx, cy) - 4;\r\n' +
'    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);\r\n' +
'\r\n' +
'    function animate(now) {\r\n' +
'      const elapsed = now - startTime;\r\n' +
'      const progress = Math.min(elapsed / duration, 1);\r\n' +
'      const eased = easeOutCubic(progress);\r\n' +
'      const currentAngle = startRotation + totalRotation * eased;\r\n' +
'\r\n' +
'      ctx.clearRect(0, 0, w, h);\r\n' +
'      ctx.save();\r\n' +
'      ctx.translate(cx, cy);\r\n' +
'      ctx.rotate(currentAngle);\r\n' +
'      ctx.translate(-cx, -cy);\r\n' +
'\r\n' +
'      // Draw slices\r\n' +
'      let startAngle = 0;\r\n' +
'      ruletaOptions.forEach((opt, i) => {\r\n' +
'        const sliceAngle = (opt.weight / totalWeight) * Math.PI * 2;\r\n' +
'        const endAngle = startAngle + sliceAngle;\r\n' +
'        const color = RULETA_COLORS[i % RULETA_COLORS.length];\r\n' +
'        ctx.beginPath();\r\n' +
'        ctx.moveTo(cx, cy);\r\n' +
'        ctx.arc(cx, cy, r, startAngle, endAngle);\r\n' +
'        ctx.closePath();\r\n' +
'        ctx.fillStyle = color;\r\n' +
'        ctx.fill();\r\n' +
'        ctx.strokeStyle = \'rgba(0,0,0,0.2)\';\r\n' +
'        ctx.lineWidth = 1;\r\n' +
'        ctx.stroke();\r\n' +
'\r\n' +
'        const midAngle = startAngle + sliceAngle / 2;\r\n' +
'        const labelR = r * 0.6;\r\n' +
'        const lx = cx + Math.cos(midAngle) * labelR;\r\n' +
'        const ly = cy + Math.sin(midAngle) * labelR;\r\n' +
'        ctx.save();\r\n' +
'        ctx.translate(lx, ly);\r\n' +
'        ctx.rotate(midAngle);\r\n' +
'        ctx.fillStyle = \'rgba(0,0,0,0.7)\';\r\n' +
'        ctx.font = \'bold 11px AritaBuri, Rajdhani, Arial\';\r\n' +
'        ctx.textAlign = \'right\';\r\n' +
'        ctx.textBaseline = \'middle\';\r\n' +
'        const label = opt.name.length > 10 ? opt.name.substring(0, 9) + \'...\' : opt.name;\r\n' +
'        ctx.fillText(label, 0, 0);\r\n' +
'        ctx.restore();\r\n' +
'        startAngle = endAngle;\r\n' +
'      });\r\n' +
'\r\n' +
'      // Center circle (fixed, not rotating)\r\n' +
'      ctx.restore();\r\n' +
'      ctx.beginPath();\r\n' +
'      ctx.arc(cx, cy, 14, 0, Math.PI * 2);\r\n' +
'      ctx.fillStyle = \'#08080e\';\r\n' +
'      ctx.fill();\r\n' +
'      ctx.strokeStyle = \'rgba(212,162,69,0.3)\';\r\n' +
'      ctx.lineWidth = 2;\r\n' +
'      ctx.stroke();\r\n' +
'\r\n' +
'      if (progress < 1) {\r\n' +
'        ruletaAnimFrame = requestAnimationFrame(animate);\r\n' +
'      } else {\r\n' +
'        ruletaIsSpinning = false;\r\n' +
'        ruletaSpinBtn.textContent = \'\u{1F3B0} GIRAR\';\r\n' +
'        ruletaSpinBtn.disabled = false;\r\n' +
'        const winner = ruletaOptions[winnerIndex];\r\n' +
'        const total = totalWeight;\r\n' +
'        const pct = ((winner.weight / total) * 100).toFixed(1);\r\n' +
'        ruletaResult.innerHTML = \'<div class=\"winner-name\">\' + escapeHtml(winner.name) + \'</div>\' +\r\n' +
'          \'<div class=\"winner-detail\">Peso \' + winner.weight + \' (\' + pct + \'% de probabilidad)</div>\';\r\n' +
'      }\r\n' +
'    }\r\n' +
'\r\n' +
'    ruletaAnimFrame = requestAnimationFrame(animate);\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaClearResult() {\r\n' +
'    ruletaResult.innerHTML = \'<div style=\"color:var(--inv-text4);font-size:13px;font-style:italic\">Agreg\u00e1 opciones y gir\u00e1 la ruleta</div>\';\r\n' +
'  }\r\n' +
'\r\n' +
'  function ruletaUpdateButton() {\r\n' +
'    ruletaSpinBtn.disabled = ruletaOptions.length < 2 || ruletaIsSpinning;\r\n' +
'  }\r\n' +
'\r\n' +
'  ruletaAddBtn.addEventListener(\'click\', ruletaAddOption);\r\n' +
'  ruletaOptInput.addEventListener(\'keydown\', (e) => { if (e.key === \'Enter\') ruletaAddOption(); });\r\n' +
'  ruletaSpinBtn.addEventListener(\'click\', ruletaSpin);\r\n' +
'  ruletaClearBtn.addEventListener(\'click\', ruletaClearAll);\r\n' +
'\r\n' +
'  // Init: draw empty wheel\r\n' +
'  ruletaDrawWheel();\r\n';

// Find the end of the COMPARISON section (after the keyboard handler for compare)
const ruletaInsertMarker = '    if (e.key === \'Enter\') doCompare();\r\n  });\r\n\r\n  setTimeout(() => {';
if (c.includes(ruletaInsertMarker)) {
  c = c.replace(ruletaInsertMarker, '    if (e.key === \'Enter\') doCompare();\r\n  });\r\n' + ruletaJS + '\r\n  setTimeout(() => {');
  ch++;
  console.log('4. Ruleta JS added');
} else console.log('4. FAIL: ruleta JS marker not found');

console.log('Total changes:', ch);
fs.writeFileSync(path, c, 'utf8');
console.log('File saved!');
