  // ============================================================
  //  PLAYER TRACKER
  // ============================================================

  let players = [];
  let playerIdCounter = 0;

  const playerNameInput = document.getElementById('playerName');
  const playerHpInput = document.getElementById('playerHp');
  const playerStaggerInput = document.getElementById('playerStagger');
  const playerAddBtn = document.getElementById('playerAddBtn');
  const playerList = document.getElementById('playerList');

  function addPlayer(name, maxHp, maxStagger) {
    const id = ++playerIdCounter;
    players.push({ id, name: name.trim() || 'Jugador ' + id, maxHp, currentHp: maxHp, maxStagger, currentStagger: maxStagger, statuses: { damageUp: 0, damageDown: 0, protection: 0, fragile: 0 } });
    renderPlayers();
    saveState();
  }

  function removePlayer(id) {
    const card = document.querySelector(`.player-card[data-id="${id}"]`);
    if (card) { card.classList.add('removing'); setTimeout(() => { players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }, 250); }
    else { players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }
  }

  function damagePlayer(id, amount, type) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    let dmg = Math.max(0, Math.floor(amount));
    if (dmg === 0) return;
    if (type !== 'stagger') {
      var _crit = poiseTryCritDamage('player');
      if (_crit.isCrit) dmg = dmg * _crit.multiplier;
      dmg = Math.round(dmg * getEntityDamageMultiplier(player));
      if (dmg < 1 && amount > 0) dmg = 1; }
    if (type === 'stagger') { player.currentStagger = Math.max(0, player.currentStagger - dmg); }
    else { player.currentHp = Math.max(0, player.currentHp - dmg); player.currentStagger = Math.max(0, player.currentStagger - dmg); }
    if (player.currentHp <= 0) { removePlayer(id); }
    else { renderPlayers(); saveState(); }
  }

  function renderPlayers() {
    if (players.length === 0) { playerList.innerHTML = '<div class="enemy-empty">No hay jugadores. Agregá uno arriba.</div>'; return; }
    let html = '';
    players.forEach(e => {
      const hpPct = Math.max(0, (e.currentHp / e.maxHp) * 100);
      const staggerPct = Math.max(0, (e.currentStagger / e.maxStagger) * 100);
      html += `
        <div class="player-card enemy-card" data-id="${e.id}">
          <div class="enemy-card-header">
            <span class="enemy-name">${escapeHtml(e.name)}</span>
            <div class="enemy-card-actions">
              <button class="enemy-delete-btn" onclick="removePlayer(${e.id})" title="Eliminar">✕</button>
              <button class="enemy-delete-btn" onclick="showPlayerHealInput(${e.id})" title="Curar" style="color:#4a9a5a;background:transparent">+</button>
            </div>
          </div>
          <div class="enemy-bar-section">
            <div class="enemy-bar-label"><span class="label" style="color:#4a9a5a">Hp</span><span class="value">${e.currentHp} / ${e.maxHp}</span></div>
            <div class="enemy-bar-track" onclick="showPlayerDamageInput(${e.id}, 'hp')"><div class="enemy-bar-fill hp" style="width:${hpPct}%"></div></div>
            <div class="enemy-damage-input" id="p-hpDmg-${e.id}">
              <input type="number" id="p-hpField-${e.id}" value="1" min="1" placeholder="Daño a Hp">
              <button class="btn-damage-apply" onclick="applyPlayerDamage(${e.id}, 'hp')">Aplicar</button>
            </div>
          </div>
          <div class="enemy-bar-section">
            <div class="enemy-bar-label"><span class="label" style="color:#d4a017">Stagger</span><span class="value">${e.currentStagger} / ${e.maxStagger}
                <button class="enemy-delete-btn" onclick="showPlayerStaggerHealInput(${e.id})" title="Curar Stagger" style="color:#d4a017;background:transparent;font-size:13px;margin-left:4px;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer">+</button></span></div>
            <div class="enemy-bar-track" onclick="showPlayerDamageInput(${e.id}, 'stagger')"><div class="enemy-bar-fill stagger" style="width:${staggerPct}%"></div></div>
            <div class="enemy-damage-input" id="p-staggerDmg-${e.id}">
              <input type="number" id="p-staggerField-${e.id}" value="1" min="1" placeholder="Daño a Stagger">
              <button class="btn-damage-apply" onclick="applyPlayerDamage(${e.id}, 'stagger')">Aplicar</button>
            </div>
            <div class="enemy-damage-input" id="p-staggerHealInput-${e.id}">
              <input type="number" id="p-staggerHealField-${e.id}" value="1" min="1" placeholder="Curar Stagger">
              <button class="btn-damage-apply" onclick="applyPlayerStaggerHeal(${e.id})" style="background:linear-gradient(135deg,#7a4a00,#b8860b)">Curar</button>
            </div>
          </div>
          <div class="enemy-damage-input" id="p-healInput-${e.id}">
            <input type="number" id="p-healField-${e.id}" value="1" min="1" placeholder="Cantidad a curar">
            <button class="btn-damage-apply" onclick="applyPlayerHeal(${e.id})" style="background:linear-gradient(135deg,#1a5c2a,#4a9a5a)">Curar</button>
          </div>
          <div class="enemy-status-section">
            <div class="enemy-status-badges">
              ${ENTITY_EFFECTS.map(eff => `
                <div class="enemy-status-badge">
                  <span class="es-left" onclick="changePlayerStatus(${e.id}, '${eff.id}', -1)"><span class="es-arrow">◀</span></span>
                  <img src="${eff.icon}" alt="${eff.name}" class="es-icon">
                  <span class="es-count">${e.statuses[eff.id] || 0}</span>
                  <span class="es-right" onclick="changePlayerStatus(${e.id}, '${eff.id}', 1)"><span class="es-arrow">▶</span></span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>`;
    });
    playerList.innerHTML = html;
  }

  function changePlayerStatus(id, effectId, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses[effectId] = Math.max(0, Math.min(10, (player.statuses[effectId] || 0) + delta));
    renderPlayers();
    saveState();
  }

  function showPlayerDamageInput(id, type) {
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    const el = document.getElementById('p-' + type + 'Dmg-' + id);
    if (!el) return;
    el.classList.add('visible');
    const field = document.getElementById('p-' + type + 'Field-' + id);
    if (field) { field.focus(); field.select(); }
  }

  function applyPlayerDamage(id, type) {
    const amt = parseInt(document.getElementById('p-' + type + 'Field-' + id)?.value) || 1;
    damagePlayer(id, amt, type);
    const el = document.getElementById('p-' + type + 'Dmg-' + id);
    if (el) el.classList.remove('visible');
  }

  function healPlayerStagger(id, amount) {
    const p = players.find(e => e.id === id);
    if (!p) return;
    const heal = Math.max(0, Math.floor(amount));
    if (heal === 0) return;
    p.currentStagger = Math.min(p.maxStagger, p.currentStagger + heal);
    renderPlayers();
    saveState();
  }

  function showPlayerStaggerHealInput(id) {
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    const el = document.getElementById('p-staggerHealInput-' + id);
    if (!el) return;
    el.classList.add('visible');
    const f = document.getElementById('p-staggerHealField-' + id);
    if (f) { f.focus(); f.select(); }
  }

  function applyPlayerStaggerHeal(id) {
    const amt = parseInt(document.getElementById('p-staggerHealField-' + id)?.value) || 1;
    healPlayerStagger(id, amt);
    const el = document.getElementById('p-staggerHealInput-' + id);
    if (el) el.classList.remove('visible');
  }

  function showPlayerHealInput(id) {
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    const el = document.getElementById('p-healInput-' + id);
    if (!el) return;
    el.classList.add('visible');
    const f = document.getElementById('p-healField-' + id);
    if (f) { f.focus(); f.select(); }
  }

  function healPlayer(id, amount) {
    const p = players.find(e => e.id === id);
    if (!p) return;
    const heal = Math.max(0, Math.floor(amount));
    if (heal === 0) return;
    p.currentHp = Math.min(p.maxHp, p.currentHp + heal);
    renderPlayers();
    saveState();
  }

  function applyPlayerHeal(id) {
    const amt = parseInt(document.getElementById('p-healField-' + id)?.value) || 1;
    healPlayer(id, amt);
    const el = document.getElementById('p-healInput-' + id);
    if (el) el.classList.remove('visible');
  }

  playerAddBtn.addEventListener('click', () => {
    const name = playerNameInput.value || 'Jugador';
    const hp = parseInt(playerHpInput.value) || 100;
    const stagger = parseInt(playerStaggerInput.value) || 50;
    if (hp < 1 || stagger < 1) return;
    addPlayer(name, hp, stagger);
    playerNameInput.value = '';
    playerNameInput.focus();
  });

  playerNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') playerAddBtn.click(); });

  document.addEventListener('keydown', (e) => {
    if (!panels.players.classList.contains('active')) return;
    if (e.key === 'Enter') {
      const a = document.activeElement;
      if (!a) return;
      if (a.id.startsWith('p-hpField-')) { applyPlayerDamage(parseInt(a.id.replace('p-hpField-', '')), 'hp'); }
      else if (a.id.startsWith('p-staggerField-')) { applyPlayerDamage(parseInt(a.id.replace('p-staggerField-', '')), 'stagger'); }
      else if (a.id.startsWith('p-staggerHealField-')) { applyPlayerStaggerHeal(parseInt(a.id.replace('p-staggerHealField-', ''))); }
      else if (a.id.startsWith('p-healField-')) { applyPlayerHeal(parseInt(a.id.replace('p-healField-', ''))); }
    }
  });