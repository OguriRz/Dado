  // ============================================================
  //  STATUS EFFECTS
  // ============================================================

  const activeStatuses = new Set();

  function updateDisplayForStatus() {
    if (lastRawTotal === null) return;
    var total = lastRawTotal;
    var parts = [];
    var tagParts = [];
    if (activeStatuses.has('paralysis')) { total = Math.floor(total / 2); parts.push('½'); tagParts.push('(½)'); }
    parts.push('(' + lastRawFormula + ')');
    if (activeStatuses.has('power')) { total += 5; parts.push('+5'); tagParts.push('+5'); }
    if (activeStatuses.has('weakness')) { total -= 5; parts.push('-5'); tagParts.push('-5'); }
    resultTotal.textContent = total;
    resultFormula.textContent = parts.join(' ') + ' = ' + total;
    const historyIdx = rollHistory.length;
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
