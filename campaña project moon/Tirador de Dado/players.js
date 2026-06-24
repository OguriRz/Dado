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
    players.push({ id, name: name.trim() || 'Jugador ' + id, maxHp, currentHp: maxHp, maxStagger, currentStagger: maxStagger, statuses: { damageUp: 0, damageDown: 0, protection: 0, fragile: 0, target: 0, targetPercent: 10, rupturePotency: 0, ruptureCount: 0, tremorPotency: 0, tremorCount: 0, burnPotency: 0, burnCount: 0, talisman: 0 }, staggered: false });
    renderPlayers();
    saveState();
  }

  function removePlayer(id) {
    const card = document.querySelector(`.player-card[data-id="${id}"]`);
    if (card) { card.classList.add('removing'); setTimeout(() => { if (!players.some(e => e.id === id)) return; players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }, 250); }
    else { players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }
  }

  function damagePlayer(id, amount, type) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    let dmg = Math.max(0, Math.floor(amount));
    if (dmg === 0) return;

    var staggeredConsumed = false;
    if (type !== 'stagger') {
      // Staggered: next hit deals x2 damage, then consumes stagger
      if (player.staggered) {
        dmg = dmg * 2;
        player.staggered = false;
        staggeredConsumed = true;
      }
      var _crit = poiseTryCritDamage('player');
      if (_crit.isCrit) dmg = dmg * _crit.multiplier;
      // Rupture adds flat bonus damage (Potencia) and consumes Contador
      var rupturePot = player.statuses.rupturePotency || 0;
      var ruptureCnt = player.statuses.ruptureCount || 0;
      if (rupturePot > 0 && ruptureCnt > 0) {
        dmg += rupturePot;
        player.statuses.ruptureCount = Math.max(0, ruptureCnt - 1);
        if (player.statuses.ruptureCount === 0) {
          player.statuses.rupturePotency = 0;
        }
      }
      dmg = Math.round(dmg * getEntityDamageMultiplier(player));
    }

    if (type === 'stagger') { player.currentStagger = Math.max(0, player.currentStagger - dmg); }
    else { player.currentHp = Math.max(0, player.currentHp - dmg); player.currentStagger = Math.max(0, player.currentStagger - dmg); }

    // Check if stagger reached 0 (but don't re-stagger if we just consumed it)
    if (!staggeredConsumed && player.currentStagger <= 0 && player.currentHp > 0) {
      player.staggered = true;
    }

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
        <div class="player-card enemy-card${e.staggered ? ' staggered' : ''}" data-id="${e.id}">
          ${e.staggered ? `<div class="staggered-overlay"><img src="${STAGGERED_IMG}" alt="Staggered" class="staggered-img"><span class="staggered-label">¡STAGGERED! ×2</span></div>` : ''}
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
              ${ENTITY_EFFECTS.filter(eff => eff.id !== 'target').map(eff => `
                <div class="enemy-status-badge">
                  <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerStatus(${e.id},'${eff.id}',-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar stack">−</button>
                  <img src="${eff.icon}" alt="${eff.name}" class="es-icon" title="${eff.name}">
                  <input type="number" class="es-input" value="${e.statuses[eff.id] || 0}"
                    onchange="setPlayerStatus(${e.id}, '${eff.id}', this.value)"
                    onfocus="this.select()" min="0" max="${eff.max || 99}">
                  <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerStatus(${e.id},'${eff.id}',1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar stack">+</button>
                </div>
              `).join('')}
              <div class="enemy-status-badge" style="gap:3px">
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerStatus(${e.id},'target',-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Marca">−</button>
                <img src="${ENTITY_EFFECTS.find(ef=>ef.id==='target').icon}" alt="Marca" class="es-icon" title="Marca">
                <input type="number" class="es-input" value="${e.statuses.target || 0}"
                  onchange="setPlayerStatus(${e.id}, 'target', this.value)"
                  onfocus="this.select()" min="0" max="1" style="width:28px">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerStatus(${e.id},'target',1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Marca">+</button>
                <span class="rup-label" style="margin:0 2px 0 6px">%</span>
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerTargetPercent(${e.id},-10))" onmouseup="holdStop()" onmouseleave="holdStop()" title="−10%">−</button>
                <input type="number" class="es-input" value="${e.statuses.targetPercent || 10}"
                  onchange="setPlayerTargetPercent(${e.id}, this.value)"
                  onfocus="this.select()" min="0" max="1000" step="10" style="width:44px">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerTargetPercent(${e.id},10))" onmouseup="holdStop()" onmouseleave="holdStop()" title="+10%">+</button>
              </div>
              <div class="enemy-status-badge rupture-badge">
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerRupturePotency(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Potencia">−</button>
                <img src="${RUP_ICON}" alt="Ruptura" class="es-icon" title="Ruptura">
                <span class="rup-label">Pot</span>
                <input type="number" class="es-input" value="${e.statuses.rupturePotency || 0}"
                  onchange="setPlayerRupturePotency(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerRupturePotency(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Potencia">+</button>
                <span class="rup-sep">│</span>
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerRuptureCount(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Contador">−</button>
                <span class="rup-label">Cnt</span>
                <input type="number" class="es-input" value="${e.statuses.ruptureCount || 0}"
                  onchange="setPlayerRuptureCount(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerRuptureCount(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Contador">+</button>
                <span class="rup-sep" style="margin:0 6px">│</span>
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerTalisman(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Talisman">−</button>
                <img src="${TALISMAN_ICON}" alt="Talisman" class="es-icon" title="Talisman" style="width:18px;height:18px">
                <input type="number" class="es-input" value="${e.statuses.talisman || 0}"
                  onchange="setPlayerTalisman(${e.id}, this.value)" onfocus="this.select()" min="0" max="3" style="width:26px">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerTalisman(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Talisman">+</button>
              </div>
              <div class="enemy-status-badge rupture-badge tremor-badge">
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerTremorPotency(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Potencia">−</button>
                <img src="${TREMOR_ICON}" alt="Tremor" class="es-icon" title="Tremor">
                <span class="rup-label">Pot</span>
                <input type="number" class="es-input" value="${e.statuses.tremorPotency || 0}"
                  onchange="setPlayerTremorPotency(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerTremorPotency(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Potencia">+</button>
                <span class="rup-sep">│</span>
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerTremorCount(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Contador">−</button>
                <span class="rup-label">Cnt</span>
                <input type="number" class="es-input" value="${e.statuses.tremorCount || 0}"
                  onchange="setPlayerTremorCount(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerTremorCount(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Contador">+</button>
                <span class="rup-sep" style="margin:0 6px">│</span>
                <button class="es-btn tremor-burst-btn" onclick="playerTremorBurst(${e.id})" title="Tremor Burst: inflige la Potencia como daño directo al Stagger">
                  <img src="${TREMOR_BURST_ICON}" alt="Tremor Burst" style="width:16px;height:16px;vertical-align:middle">
                </button>
              </div>
              <div class="enemy-status-badge rupture-badge burn-badge">
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerBurnPotency(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Potencia">−</button>
                <img src="${BURN_ICON}" alt="Burn" class="es-icon" title="Burn">
                <span class="rup-label">Pot</span>
                <input type="number" class="es-input" value="${e.statuses.burnPotency || 0}"
                  onchange="setPlayerBurnPotency(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerBurnPotency(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Potencia">+</button>
                <span class="rup-sep">│</span>
                <button class="es-btn es-minus" onmousedown="holdStart(event,()=>changePlayerBurnCount(${e.id},-1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Quitar Contador">−</button>
                <span class="rup-label">Cnt</span>
                <input type="number" class="es-input" value="${e.statuses.burnCount || 0}"
                  onchange="setPlayerBurnCount(${e.id}, this.value)" onfocus="this.select()" min="0" max="10000">
                <button class="es-btn es-plus" onmousedown="holdStart(event,()=>changePlayerBurnCount(${e.id},1))" onmouseup="holdStop()" onmouseleave="holdStop()" title="Agregar Contador">+</button>
              </div>
            </div>
            <div class="enemy-status-summary">
              <span class="sum-item">Multiplicador: <span class="sum-val ${getEntityMultiplierClass(e)}">×${getEntityDamageMultiplier(e).toFixed(2)}</span></span>
              ${(e.statuses.rupturePotency || 0) > 0 && (e.statuses.ruptureCount || 0) > 0 ? `<span class="sum-item">Ruptura: <span class="sum-val positive">+${e.statuses.rupturePotency} (x${e.statuses.ruptureCount} golpes)</span></span>` : ''}
              ${(e.statuses.tremorPotency || 0) > 0 && (e.statuses.tremorCount || 0) > 0 ? `<span class="sum-item">Tremor: <span class="sum-val positive">${e.statuses.tremorPotency} (x${e.statuses.tremorCount})</span></span>` : ''}
              ${(e.statuses.burnPotency || 0) > 0 && (e.statuses.burnCount || 0) > 0 ? `<span class="sum-item">Burn: <span class="sum-val alert">${e.statuses.burnPotency}/turno (x${e.statuses.burnCount})</span></span>` : ''}
            </div>
          </div>
        </div>`;
    });
    playerList.innerHTML = html;
  }

  function changePlayerTargetPercent(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    const cur = player.statuses.targetPercent || 10;
    player.statuses.targetPercent = Math.max(0, Math.min(1000, cur + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerTargetPercent(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.targetPercent = Math.max(0, Math.min(1000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  function changePlayerStatus(id, effectId, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    const cur = player.statuses[effectId] || 0;
    const max = getEffectMax(effectId);
    player.statuses[effectId] = Math.max(0, Math.min(max, cur + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerStatus(id, effectId, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    const max = getEffectMax(effectId);
    player.statuses[effectId] = Math.max(0, Math.min(max, parseInt(value) || 0));
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
    // If stagger recovers above 0, staggered state ends
    if (p.staggered && p.currentStagger > 0) {
      p.staggered = false;
    }
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

  // ============================================================
  //  PLAYER TALISMAN
  // ============================================================

  function changePlayerTalisman(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    var cur = player.statuses.talisman || 0;
    var newVal = cur + delta;
    if (newVal >= 3) {
      // Talisman completa: +10 Rupture Pot, +2 Rupture Count
      player.statuses.rupturePotency = (player.statuses.rupturePotency || 0) + 10;
      player.statuses.ruptureCount = (player.statuses.ruptureCount || 0) + 2;
      player.statuses.talisman = 0;
    } else {
      player.statuses.talisman = Math.max(0, Math.min(3, newVal));
    }
    renderPlayers();
    saveState();
  }

  function setPlayerTalisman(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    var newVal = parseInt(value) || 0;
    if (newVal >= 3) {
      player.statuses.rupturePotency = (player.statuses.rupturePotency || 0) + 10;
      player.statuses.ruptureCount = (player.statuses.ruptureCount || 0) + 2;
      player.statuses.talisman = 0;
    } else {
      player.statuses.talisman = Math.max(0, Math.min(3, newVal));
    }
    renderPlayers();
    saveState();
  }

  // ============================================================
  //  PLAYER BURN
  // ============================================================

  function changePlayerBurnPotency(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.burnPotency = Math.max(0, Math.min(10000, (player.statuses.burnPotency || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerBurnPotency(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.burnPotency = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  function changePlayerBurnCount(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.burnCount = Math.max(0, Math.min(10000, (player.statuses.burnCount || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerBurnCount(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.burnCount = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  // ============================================================
  //  PLAYER RUPTURE
  // ============================================================

  function changePlayerRupturePotency(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.rupturePotency = Math.max(0, Math.min(10000, (player.statuses.rupturePotency || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerRupturePotency(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.rupturePotency = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  function changePlayerRuptureCount(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.ruptureCount = Math.max(0, Math.min(10000, (player.statuses.ruptureCount || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerRuptureCount(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.ruptureCount = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  // ============================================================
  //  PLAYER TREMOR
  // ============================================================

  function changePlayerTremorPotency(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.tremorPotency = Math.max(0, Math.min(10000, (player.statuses.tremorPotency || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerTremorPotency(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.tremorPotency = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  function changePlayerTremorCount(id, delta) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.tremorCount = Math.max(0, Math.min(10000, (player.statuses.tremorCount || 0) + delta));
    renderPlayers();
    saveState();
  }

  function setPlayerTremorCount(id, value) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    player.statuses.tremorCount = Math.max(0, Math.min(10000, parseInt(value) || 0));
    renderPlayers();
    saveState();
  }

  function playerTremorBurst(id) {
    const player = players.find(e => e.id === id);
    if (!player) return;
    var potency = player.statuses.tremorPotency || 0;
    var count = player.statuses.tremorCount || 0;
    if (potency <= 0 || count <= 0) return;
    // Deal Tremor potency as direct Stagger damage
    player.currentStagger = Math.max(0, player.currentStagger - potency);
    player.statuses.tremorCount = Math.max(0, count - 1);
    if (player.statuses.tremorCount === 0) {
      player.statuses.tremorPotency = 0;
    }
    renderPlayers();
    saveState();
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