  // ============================================================
  //  RULETA (Spin Wheel)
  // ============================================================

  const RULETA_COLORS = [
    "#d4a245", "#c0395a", "#2980b9", "#27ae60", "#8e44ad",
    "#16a085", "#b8860b", "#e67e22", "#2c3e50", "#7f8c8d",
    "#1abc9c", "#3498db", "#9b59b6", "#f39c12", "#e74c3c",
    "#2ecc71", "#3a7ec0", "#d35400", "#6c3483", "#148f77",
  ];

  let ruletaOptions = [];
  let ruletaIsSpinning = false;
  let ruletaAnimFrame = null;

  const ruletaOptInput = document.getElementById('ruletaOptionInput');
  const ruletaWeightInput = document.getElementById('ruletaWeightInput');
  const ruletaAddBtn = document.getElementById('ruletaAddBtn');
  const ruletaOptList = document.getElementById('ruletaOptionList');
  const ruletaEmpty = document.getElementById('ruletaEmpty');
  const ruletaCanvas = document.getElementById('ruletaCanvas');
  const ruletaSpinBtn = document.getElementById('ruletaSpinBtn');
  const ruletaClearBtn = document.getElementById('ruletaClearBtn');
  const ruletaResult = document.getElementById('ruletaResult');

  function ruletaAddOption() {
    const name = ruletaOptInput.value.trim();
    if (!name) return;
    const weight = Math.max(1, parseInt(ruletaWeightInput.value) || 1);
    if (ruletaOptions.some(o => o.name.toLowerCase() === name.toLowerCase())) return;
    ruletaOptions.push({ name, weight });
    ruletaOptInput.value = '';
    ruletaOptInput.focus();
    ruletaRenderOptions();
    ruletaDrawWheel();
    ruletaUpdateButton();
    ruletaClearResult();
    saveState();
  }

  function ruletaRemoveOption(index) {
    ruletaOptions.splice(index, 1);
    ruletaRenderOptions();
    ruletaDrawWheel();
    ruletaUpdateButton();
    ruletaClearResult();
    saveState();
  }

  function ruletaUpdateWeight(index, newWeight) {
    const w = Math.max(1, parseInt(newWeight) || 1);
    ruletaOptions[index].weight = w;
    ruletaDrawWheel();
    saveState();
  }

  function ruletaClearAll() {
    ruletaOptions = [];
    ruletaRenderOptions();
    ruletaDrawWheel();
    ruletaUpdateButton();
    ruletaClearResult();
    saveState();
    if (ruletaAnimFrame) { cancelAnimationFrame(ruletaAnimFrame); ruletaAnimFrame = null; }
    ruletaIsSpinning = false;
  }

  function ruletaRenderOptions() {
    if (ruletaOptions.length === 0) {
      ruletaOptList.innerHTML = '<div class="ruleta-empty" id="ruletaEmpty">Agregá opciones con su peso probabilidad</div>';
      return;
    }
    let html = '';
    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);
    ruletaOptions.forEach((opt, i) => {
      const color = RULETA_COLORS[i % RULETA_COLORS.length];
      const pct = ((opt.weight / totalWeight) * 100).toFixed(1);
      html += '<div class="ruleta-option-chip" style="background:' + color + '">' +
        '<span class="opt-name">' + escapeHtml(opt.name) + '</span>' +
        '<input type="number" class="opt-weight-input" value="' + opt.weight + '" min="1" max="999"' +
        ' onchange="ruletaUpdateWeight(' + i + ', this.value)" style="width:36px;padding:1px 2px;border:none;background:rgba(0,0,0,0.15);border-radius:2px;color:#1a0e00;font-weight:700;font-size:11px;text-align:center;outline:none">' +
        '<span class="opt-weight">(' + pct + '%)</span>' +
        '<button class="opt-remove" onclick="ruletaRemoveOption(' + i + ')">✕</button>' +
        '</div>';
    });
    ruletaOptList.innerHTML = html;
  }

  function ruletaDrawWheel() {
    const ctx = ruletaCanvas.getContext('2d');
    const w = ruletaCanvas.width;
    const h = ruletaCanvas.height;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(cx, cy) - 4;

    ctx.clearRect(0, 0, w, h);

    if (ruletaOptions.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,162,69,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,162,69,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(212,162,69,0.3)';
      ctx.font = '14px AritaBuri, Rajdhani, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sin opciones', cx, cy);
      return;
    }

    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);
    let startAngle = 0;

    ruletaOptions.forEach((opt, i) => {
      const sliceAngle = (opt.weight / totalWeight) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = RULETA_COLORS[i % RULETA_COLORS.length];

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = r * 0.6;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = 'bold 11px AritaBuri, Rajdhani, Arial';
      ctx.textBaseline = 'middle';
      const label = opt.name.length > 10 ? opt.name.substring(0, 9) + '...' : opt.name;
      // Flip text on left side so it is never upside-down
      if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
        ctx.rotate(Math.PI);
        ctx.textAlign = 'left';
        ctx.fillText(label, 0, 0);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, 0);
      }
      ctx.restore();

      startAngle = endAngle;
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#08080e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,162,69,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function ruletaPickWinner() {
    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < ruletaOptions.length; i++) {
      roll -= ruletaOptions[i].weight;
      if (roll <= 0) return i;
    }
    return ruletaOptions.length - 1;
  }

  function ruletaGetAngleForIndex(index) {
    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);
    let angle = 0;
    for (let i = 0; i < index; i++) {
      angle += (ruletaOptions[i].weight / totalWeight) * Math.PI * 2;
    }
    // Add half the slice so the arrow points at the center of the winning slice
    angle += (ruletaOptions[index].weight / totalWeight) * Math.PI;
    return angle;
  }

  function ruletaSpin() {
    if (ruletaIsSpinning || ruletaOptions.length === 0) return;
    ruletaIsSpinning = true;
    ruletaSpinBtn.disabled = true;
    ruletaSpinBtn.textContent = '🎰 GIRANDO...';
    ruletaResult.innerHTML = '<div style="color:var(--inv-text4);font-style:italic">Girando...</div>';

    const winnerIndex = ruletaPickWinner();
    const targetAngle = ruletaGetAngleForIndex(winnerIndex);
    const extraSpins = 4 + Math.floor(Math.random() * 3); // 4-6 full rotations
    const totalRotation = extraSpins * Math.PI * 2 + (Math.PI * 3 / 2 - targetAngle);

    const startRotation = 0;
    const duration = 3000 + Math.random() * 1000; // 3-4 seconds
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    const ctx = ruletaCanvas.getContext('2d');
    const w = ruletaCanvas.width, h = ruletaCanvas.height;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(cx, cy) - 4;
    const totalWeight = ruletaOptions.reduce((s, o) => s + o.weight, 0);

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const currentAngle = startRotation + totalRotation * eased;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(currentAngle);
      ctx.translate(-cx, -cy);

      // Draw slices
      let startAngle = 0;
      ruletaOptions.forEach((opt, i) => {
        const sliceAngle = (opt.weight / totalWeight) * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;
        const color = RULETA_COLORS[i % RULETA_COLORS.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const midAngle = startAngle + sliceAngle / 2;
        const labelR = r * 0.6;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(midAngle);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.font = 'bold 11px AritaBuri, Rajdhani, Arial';
        ctx.textBaseline = 'middle';
        const label = opt.name.length > 10 ? opt.name.substring(0, 9) + '...' : opt.name;
        // Flip text on left side so it is never upside-down
        if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
          ctx.rotate(Math.PI);
          ctx.textAlign = 'left';
          ctx.fillText(label, 0, 0);
        } else {
          ctx.textAlign = 'right';
          ctx.fillText(label, 0, 0);
        }
        ctx.restore();
        startAngle = endAngle;
      });

      // Center circle (fixed, not rotating)
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#08080e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,162,69,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (progress < 1) {
        ruletaAnimFrame = requestAnimationFrame(animate);
      } else {
        ruletaIsSpinning = false;
        ruletaSpinBtn.textContent = '🎰 GIRAR';
        ruletaSpinBtn.disabled = false;
        const winner = ruletaOptions[winnerIndex];
        const total = totalWeight;
        const pct = ((winner.weight / total) * 100).toFixed(1);
        ruletaResult.innerHTML = '<div class="winner-name">' + escapeHtml(winner.name) + '</div>' +
          '<div class="winner-detail">Peso ' + winner.weight + ' (' + pct + '% de probabilidad)</div>';
      }
    }

    ruletaAnimFrame = requestAnimationFrame(animate);
  }

  function ruletaClearResult() {
    ruletaResult.innerHTML = '<div style="color:var(--inv-text4);font-size:13px;font-style:italic">Agregá opciones y girá la ruleta</div>';
  }

  function ruletaUpdateButton() {
    ruletaSpinBtn.disabled = ruletaOptions.length < 2 || ruletaIsSpinning;
  }

  ruletaAddBtn.addEventListener('click', ruletaAddOption);
  ruletaOptInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') ruletaAddOption(); });
  ruletaSpinBtn.addEventListener('click', ruletaSpin);
  ruletaClearBtn.addEventListener('click', ruletaClearAll);

  // Init: draw empty wheel
  ruletaDrawWheel();
