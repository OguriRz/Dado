  // ============================================================
  //  CALCULATOR
  // ============================================================

  const MAX_DIGITS = 15;
  let calcValue = '0';
  let calcPrev = '';
  let calcOp = null;
  let calcReset = false;
  let calcFormula = '';

  const calcResultEl = document.getElementById('calcResult');
  const calcFormulaEl = document.getElementById('calcFormula');

  function calcUpdateDisplay() {
    let display = calcValue;
    if (display.length > MAX_DIGITS + 3) display = parseFloat(display).toExponential(6);
    calcResultEl.textContent = display;
    calcResultEl.classList.toggle('error', false);
    calcFormulaEl.textContent = calcFormula;
  }

  function calcDigit(d) {
    if (calcReset) { calcValue = String(d); calcReset = false; }
    else {
      if (calcValue === '0' && d !== '.') calcValue = String(d);
      else { if (calcValue.replace('-','').replace('.','').length >= MAX_DIGITS) return; calcValue += String(d); }
    }
    calcUpdateDisplay();
  }

  function calcDecimal() {
    if (calcReset) { calcValue = '0.'; calcReset = false; calcUpdateDisplay(); return; }
    if (calcValue.includes('.')) return;
    calcValue += '.';
    calcUpdateDisplay();
  }

  function calcNegate() {
    if (calcValue === '0') return;
    calcValue = calcValue.startsWith('-') ? calcValue.slice(1) : '-' + calcValue;
    calcUpdateDisplay();
  }

  function calcPercent() {
    const v = parseFloat(calcValue);
    if (isNaN(v)) return;
    calcValue = String(v / 100);
    calcUpdateDisplay();
  }

  function calcBackspace() {
    if (calcReset) return;
    if (calcValue.length <= 1 || (calcValue.length === 2 && calcValue.startsWith('-'))) calcValue = '0';
    else calcValue = calcValue.slice(0, -1);
    calcUpdateDisplay();
  }

  function calcClear() {
    calcValue = '0'; calcPrev = ''; calcOp = null; calcReset = false; calcFormula = '';
    calcResultEl.classList.remove('error');
    calcUpdateDisplay();
  }

  function calcSetOp(op) {
    if (calcOp !== null) calcDoEquals();
    calcPrev = calcValue;
    calcOp = op;
    calcReset = true;
    const sym = { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op] || '?';
    calcFormula = calcPrev + ' ' + sym;
    calcUpdateDisplay();
  }

  function calcDoEquals() {
    if (calcOp === null || calcReset) return;
    const prev = parseFloat(calcPrev);
    const curr = parseFloat(calcValue);
    if (isNaN(prev) || isNaN(curr)) return;
    const sym = { add: '+', subtract: '−', multiply: '×', divide: '÷' }[calcOp] || '?';
    const raw = calcPrev + ' ' + sym + ' ' + calcValue;
    let result;
    switch (calcOp) {
      case 'add': result = prev + curr; break;
      case 'subtract': result = prev - curr; break;
      case 'multiply': result = prev * curr; break;
      case 'divide':
        if (curr === 0) { calcResultEl.textContent = 'Error: Div/0'; calcResultEl.classList.add('error'); calcFormulaEl.textContent = raw; calcOp = null; calcReset = true; return; }
        result = prev / curr; break;
      default: return;
    }
    if (!isFinite(result)) { calcResultEl.textContent = 'Error'; calcResultEl.classList.add('error'); calcFormulaEl.textContent = raw; calcOp = null; calcReset = true; return; }
    calcFormula = raw + ' =';
    calcValue = String(parseFloat(result.toFixed(10)));
    calcOp = null;
    calcReset = true;
    calcResultEl.classList.remove('error');
    calcUpdateDisplay();
  }

  document.querySelector('.calc-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-btn');
    if (!btn) return;
    const a = btn.dataset.action;
    const v = btn.dataset.value;
    switch (a) {
      case 'digit': calcDigit(parseInt(v)); break;
      case 'decimal': calcDecimal(); break;
      case 'negate': calcNegate(); break;
      case 'clear': calcClear(); break;
      case 'backspace': calcBackspace(); break;
      case 'percent': calcPercent(); break;
      case 'equals': calcDoEquals(); break;
      case 'add': case 'subtract': case 'multiply': case 'divide': calcSetOp(a); break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!panels.calc.classList.contains('active')) return;
    if (e.key >= '0' && e.key <= '9') { calcDigit(parseInt(e.key)); return; }
    if (e.key === '.' || e.key === ',') { calcDecimal(); return; }
    if (e.key === 'Enter' || e.key === '=') { calcDoEquals(); return; }
    if (e.key === '+') { calcSetOp('add'); return; }
    if (e.key === '-') { calcSetOp('subtract'); return; }
    if (e.key === '*') { calcSetOp('multiply'); return; }
    if (e.key === '/') { e.preventDefault(); calcSetOp('divide'); return; }
    if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { calcClear(); return; }
    if (e.key === 'Backspace') { calcBackspace(); return; }
    if (e.key === '%') { calcPercent(); return; }
  });
