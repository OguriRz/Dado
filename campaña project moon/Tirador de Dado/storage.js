  // ============================================================
  //  PERSISTENCE — localStorage (bonus + last roll)
  // ============================================================

  function saveState() {
    localStorage.setItem('diceTool_bonus', bonusInput.value);
    localStorage.setItem('diceTool_diceCount', diceCountInput.value);
    localStorage.setItem('diceTool_pool', JSON.stringify(pool));
    localStorage.setItem('diceTool_coins', JSON.stringify(coinsState));
    localStorage.setItem('diceTool_coinId', String(coinIdCounter));
    localStorage.setItem('diceTool_enemies', JSON.stringify(enemies));
    localStorage.setItem('diceTool_enemyId', String(enemyIdCounter));
    localStorage.setItem('diceTool_players', JSON.stringify(players));
    localStorage.setItem('diceTool_playerId', String(playerIdCounter));
    localStorage.setItem('diceTool_ruleta', JSON.stringify(ruletaOptions));
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
      localStorage.setItem('diceTool_lastRoll', JSON.stringify(state));
    }
  }

  function loadState() {
    const savedBonus = localStorage.getItem('diceTool_bonus');
    if (savedBonus !== null) {
      bonusInput.value = savedBonus;
    }

    const savedCount = localStorage.getItem('diceTool_diceCount');
    if (savedCount !== null) {
      diceCountInput.value = savedCount;
    }

    const savedPool = localStorage.getItem('diceTool_pool');
    if (savedPool) {
      try {
        pool = JSON.parse(savedPool);
        renderPool();
        updateRollButton();
      } catch (e) { pool = []; }
    }

    const savedCoins = localStorage.getItem('diceTool_coins');
    if (savedCoins) {
      try {
        coinsState = JSON.parse(savedCoins);
        const savedCoinId = localStorage.getItem('diceTool_coinId');
        if (savedCoinId !== null) coinIdCounter = parseInt(savedCoinId) || 0;
        renderCoins();
      } catch (e) { /* ignore */ }
    }

    const savedEnemies = localStorage.getItem('diceTool_enemies');
    if (savedEnemies) {
      try {
        enemies = JSON.parse(savedEnemies);
        const savedEnemyId = localStorage.getItem('diceTool_enemyId');
        if (savedEnemyId !== null) enemyIdCounter = parseInt(savedEnemyId) || 0;
        renderEnemies();
      } catch (e) { /* ignore */ }
    }

    const savedPlayers = localStorage.getItem('diceTool_players');
    if (savedPlayers) {
      try {
        players = JSON.parse(savedPlayers);
        const savedPlayerId = localStorage.getItem('diceTool_playerId');
        if (savedPlayerId !== null) playerIdCounter = parseInt(savedPlayerId) || 0;
        renderPlayers();
      } catch (e) { /* ignore */ }
    }

    const savedRuleta = localStorage.getItem('diceTool_ruleta');
    if (savedRuleta) {
      try {
        ruletaOptions = JSON.parse(savedRuleta);
        ruletaRenderOptions();
        ruletaDrawWheel();
        ruletaUpdateButton();
      } catch (e) { /* ignore */ }
    }

    const savedRoll = localStorage.getItem('diceTool_lastRoll');
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
          if (activeStatuses.has('paralysis')) { total = Math.floor(total / 2); formulaParts.push('½'); }
          formulaParts.push('(' + data.formula + ')');
          if (activeStatuses.has('power')) { total += 5; formulaParts.push('+5'); }
          if (activeStatuses.has('weakness')) { total -= 5; formulaParts.push('-5'); }
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
