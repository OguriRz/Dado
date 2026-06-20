  // ============================================================
  //  PERSISTENCE — localStorage (bonus + last roll)
  // ============================================================

  function saveState() {
    localStorage.setItem('freebuff_bonus', bonusInput.value);
    localStorage.setItem('freebuff_diceCount', diceCountInput.value);
    localStorage.setItem('freebuff_pool', JSON.stringify(pool));
    localStorage.setItem('freebuff_coins', JSON.stringify(coinsState));
    localStorage.setItem('freebuff_coinId', String(coinIdCounter));
    localStorage.setItem('freebuff_enemies', JSON.stringify(enemies));
    localStorage.setItem('freebuff_enemyId', String(enemyIdCounter));
    localStorage.setItem('freebuff_players', JSON.stringify(players));
    localStorage.setItem('freebuff_playerId', String(playerIdCounter));
    localStorage.setItem('freebuff_ruleta', JSON.stringify(ruletaOptions));
    localStorage.setItem('freebuff_movRemaining', String(movRemaining));
    localStorage.setItem('freebuff_movTotal', String(movTotal));
    localStorage.setItem('freebuff_ventaja', String(ventajaStacks));
    localStorage.setItem('freebuff_desventaja', String(desventajaStacks));
    if (lastRawTotal !== null) {
      const state = {
        total: lastRollTotal,
        rawTotal: lastRawTotal,
        formula: lastRawFormula,
        historyIdx: rollHistory.length,
      };
      if (rollHistory.length > 0) {
        const last = rollHistory[rollHistory.length - 1];
        state.lastResults = last.results.slice(0, 40);
        state.lastSides = last.allSides.slice(0, 40);
      }
      localStorage.setItem('freebuff_lastRoll', JSON.stringify(state));
    }
  }

  function loadState() {
    const savedBonus = localStorage.getItem('freebuff_bonus');
    if (savedBonus !== null) {
      bonusInput.value = savedBonus;
    }

    const savedCount = localStorage.getItem('freebuff_diceCount');
    if (savedCount !== null) {
      diceCountInput.value = savedCount;
    }

    const savedPool = localStorage.getItem('freebuff_pool');
    if (savedPool) {
      try {
        pool = JSON.parse(savedPool);
        renderPool();
        updateRollButton();
      } catch (e) { pool = []; }
    }

    const savedCoins = localStorage.getItem('freebuff_coins');
    if (savedCoins) {
      try {
        coinsState = JSON.parse(savedCoins);
        const savedCoinId = localStorage.getItem('freebuff_coinId');
        if (savedCoinId !== null) coinIdCounter = parseInt(savedCoinId) || 0;
        renderCoins();
      } catch (e) { /* ignore */ }
    }

    const savedEnemies = localStorage.getItem('freebuff_enemies');
    if (savedEnemies) {
      try {
        enemies = JSON.parse(savedEnemies);
        const savedEnemyId = localStorage.getItem('freebuff_enemyId');
        if (savedEnemyId !== null) enemyIdCounter = parseInt(savedEnemyId) || 0;
        renderEnemies();
      } catch (e) { /* ignore */ }
    }

    const savedPlayers = localStorage.getItem('freebuff_players');
    if (savedPlayers) {
      try {
        players = JSON.parse(savedPlayers);
        const savedPlayerId = localStorage.getItem('freebuff_playerId');
        if (savedPlayerId !== null) playerIdCounter = parseInt(savedPlayerId) || 0;
        renderPlayers();
      } catch (e) { /* ignore */ }
    }

    const savedMovTotal = localStorage.getItem('freebuff_movTotal');
    if (savedMovTotal !== null) {
      movTotal = parseInt(savedMovTotal) || 35;
    }
    const savedMovRemaining = localStorage.getItem('freebuff_movRemaining');
    if (savedMovRemaining !== null) {
      movRemaining = parseInt(savedMovRemaining) || movTotal;
    } else {
      movRemaining = movTotal; // Migración: restaurar al total
    }
    renderMovimientos();

    const savedVentaja = localStorage.getItem('freebuff_ventaja');
    if (savedVentaja !== null) {
      ventajaStacks = parseInt(savedVentaja) || 0;
    }
    const savedDesventaja = localStorage.getItem('freebuff_desventaja');
    if (savedDesventaja !== null) {
      desventajaStacks = parseInt(savedDesventaja) || 0;
    }
    renderStacks();

    const savedRuleta = localStorage.getItem('freebuff_ruleta');
    if (savedRuleta) {
      try {
        ruletaOptions = JSON.parse(savedRuleta);
        ruletaRenderOptions();
        ruletaDrawWheel();
        ruletaUpdateButton();
      } catch (e) { /* ignore */ }
    }

    const savedRoll = localStorage.getItem('freebuff_lastRoll');
    if (savedRoll) {
      try {
        const data = JSON.parse(savedRoll);
        if (data.formula && data.rawTotal !== null) {
          lastRawTotal = data.rawTotal;
          lastRollTotal = data.total;
          lastRawFormula = data.formula;

          // Reconstruir display
          var total = data.rawTotal;
          var formulaParts = [];
          formulaParts.push('(' + data.formula + ')');
          if (ventajaStacks > 0) { total += ventajaStacks; formulaParts.push('+' + ventajaStacks); }
          if (desventajaStacks > 0) { total -= desventajaStacks; formulaParts.push('−' + desventajaStacks); }
          if (activeStatuses.has('paralysis')) { total = Math.floor(total / 2); formulaParts.push('½'); }
          resultTotal.textContent = total;
          resultFormula.textContent = formulaParts.join(' ') + ' = ' + total;

          if (data.lastResults && data.lastSides) {
            renderDiceVisuals(data.lastResults, data.lastSides, false);
          }

          lastRollTag.textContent = '#' + (data.historyIdx || '?') + ': ' + data.total;
          document.getElementById('sendToCompare').style.display = 'flex';
        }
      } catch (e) { /* ignore corrupt data */ }
    }
  }

  // Restore state on load
  loadState();

  // Add default D20 only if pool is empty
  if (pool.length === 0) {
    addToPool(20);
  }
