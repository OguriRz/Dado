  // ============================================================
  //  COINS TRACKER (Acciones / Reacciones)
  // ============================================================

  const COIN_IMG = 'https://limbuscompany.wiki.gg/images/thumb/Coin.png/26px-Coin.png?245b33';
  let coinsState = { action: [], reaction: [] };
  let coinIdCounter = 0;
  let movRemaining = 35;  // Movimientos restantes
  let movTotal = 35;      // Total de movimientos disponibles

  function renderMovimientos() {
    const remainingEl = document.getElementById('movRemaining');
    const totalInput = document.getElementById('movTotalInput');
    if (remainingEl) remainingEl.textContent = movRemaining;
    if (totalInput) totalInput.value = movTotal;
  }

  function spendMovimiento() {
    if (movRemaining <= 0) return;
    movRemaining--;
    renderMovimientos();
    saveState();
  }

  function recoverMovimiento() {
    if (movRemaining >= movTotal) return;
    movRemaining++;
    renderMovimientos();
    saveState();
  }

  function setMovTotal(val) {
    const v = parseInt(val) || 1;
    movTotal = Math.max(1, Math.min(999, v));
    if (movRemaining > movTotal) movRemaining = movTotal;
    renderMovimientos();
    saveState();
  }

  function renderCoins() {
    ['action', 'reaction'].forEach(type => {
      const container = document.getElementById(type === 'action' ? 'coinsActions' : 'coinsReactions');
      if (!container) return;
      container.innerHTML = coinsState[type].map(c => `
        <div class="coin-piece ${type}${c.used ? ' used' : ''}" onclick="toggleCoin('${type}', ${c.id})" title="${c.used ? 'Recargar' : 'Gastar'}">
          <img src="${COIN_IMG}" alt="${type}" class="coin-img">
        </div>
      `).join('');
    });
  }

  function addCoin(type) {
    coinsState[type].push({ id: ++coinIdCounter, used: false });
    renderCoins();
    saveState();
  }

  function removeCoin(type) {
    if (coinsState[type].length === 0) return;
    coinsState[type].pop();
    renderCoins();
    saveState();
  }

  function toggleCoin(type, id) {
    const coin = coinsState[type].find(c => c.id === id);
    if (!coin) return;
    coin.used = !coin.used;
    renderCoins();
    saveState();
  }

  function finDelTurno() {
    coinsState.action.forEach(c => c.used = false);
    coinsState.reaction.forEach(c => c.used = false);
    movRemaining = movTotal;
    renderCoins();
    renderMovimientos();
    saveState();
    poiseEndTurn('enemy');
    poiseEndTurn('player');
    ruptureEndTurn();
  }
