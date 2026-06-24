  // ============================================================
  //  STATUS EFFECTS
  // ============================================================

  const activeStatuses = new Set();
  let ventajaStacks = 0;
  let desventajaStacks = 0;

  const STACK_BONUS = 1; // +1 por stack de Ventaja, -1 por stack de Desventaja

  function updateDisplayForStatus() {
    if (lastRawTotal === null) return;
    var total = lastRawTotal;
    var parts = [];
    var tagParts = [];
    parts.push('(' + lastRawFormula + ')');
    if (ventajaStacks > 0) { total += ventajaStacks * STACK_BONUS; parts.push('+' + ventajaStacks * STACK_BONUS); tagParts.push('+Adv'); }
    if (desventajaStacks > 0) { total -= desventajaStacks * STACK_BONUS; parts.push('−' + desventajaStacks * STACK_BONUS); tagParts.push('−Dis'); }
    if (activeStatuses.has('paralysis')) { total = Math.floor(total / 2); parts.push('½'); tagParts.push('(½)'); }

    resultTotal.textContent = total;
    resultFormula.textContent = parts.join(' ') + ' = ' + total;
    const historyIdx = lastHistoryIdx || rollHistory.length;
    var tagSuffix = tagParts.length > 0 ? ' ' + tagParts.join(' ') : '';
    lastRollTag.textContent = '#' + historyIdx + ': ' + total + tagSuffix;
    lastRollTotal = total;
  }

  function toggleStatus(status) {
    const el = document.querySelector(`.status-badge[data-status="${status}"]`);
    if (!el) return;
    if (activeStatuses.has(status)) {
      activeStatuses.delete(status);
      el.classList.remove('active');
    } else {
      activeStatuses.add(status);
      el.classList.add('active');
    }
    updateDisplayForStatus();
  }

  function renderStacks() {
    const vEl = document.getElementById('ventajaCount');
    const dEl = document.getElementById('desventajaCount');
    if (vEl) vEl.value = ventajaStacks;
    if (dEl) dEl.value = desventajaStacks;
  }

  function addVentaja(n) {
    ventajaStacks = Math.max(0, Math.min(10000, ventajaStacks + n));
    renderStacks();
    updateDisplayForStatus();
    saveState();
  }

  function setVentaja(val) {
    ventajaStacks = Math.max(0, Math.min(10000, parseInt(val) || 0));
    renderStacks();
    updateDisplayForStatus();
    saveState();
  }

  function addDesventaja(n) {
    desventajaStacks = Math.max(0, Math.min(10000, desventajaStacks + n));
    renderStacks();
    updateDisplayForStatus();
    saveState();
  }

  function setDesventaja(val) {
    desventajaStacks = Math.max(0, Math.min(10000, parseInt(val) || 0));
    renderStacks();
    updateDisplayForStatus();
    saveState();
  }
