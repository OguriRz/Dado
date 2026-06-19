const fs = require('fs');
const path = 'campaña project moon/Tirador de Dado/index.html';
let c = fs.readFileSync(path, 'utf8');
let ch = 0;

// Helper
function insertBefore(marker, text) {
  const idx = c.indexOf(marker);
  if (idx < 0) { console.log('NOT FOUND:', marker.substring(0, 40)); return false; }
  c = c.substring(0, idx) + text + c.substring(idx);
  ch++;
  return true;
}

function replaceOnce(oldStr, newStr) {
  if (!c.includes(oldStr)) { console.log('NOT FOUND:', oldStr.substring(0, 40)); return false; }
  c = c.replace(oldStr, newStr);
  ch++;
  return true;
}

// 1. Tab button - insert before the "Comparar" button
const makeBtn = '    <button class="tab-btn" data-tab="players">\u{1F6E1}\uFE0F Jugadores</button>\r\n';
const found = insertBefore('<button class="tab-btn" data-tab="compare">\u2696\uFE0F Comparar</button>', makeBtn);
if (!found) process.exit(1);

// 2. Player panel HTML before TAB 4 COMPARE
const playerHTML =
'  <!-- ============ TAB: PLAYERS ============ -->\r\n' +
'  <div class="tab-panel" id="tabPlayers">\r\n' +
'    <div class="enemy-form" id="playerForm">\r\n' +
'      <div class="field"><label>Nombre</label><input type="text" id="playerName" placeholder="Ej: Roland" maxlength="30"></div>\r\n' +
'      <div class="field"><label>HP</label><input type="number" id="playerHp" value="100" min="1"></div>\r\n' +
'      <div class="field"><label>Stagger</label><input type="number" id="playerStagger" value="50" min="1"></div>\r\n' +
'      <button class="btn-enemy-add" id="playerAddBtn">+ Agregar</button>\r\n' +
'    </div>\r\n' +
'    <div class="enemy-list" id="playerList">\r\n' +
'      <div class="enemy-empty">No hay jugadores. Agreg\u00e1 uno arriba.</div>\r\n' +
'    </div>\r\n' +
'    <div class="section-divider" style="margin-bottom:0"></div>\r\n' +
'  </div>\r\n\r\n';
insertBefore('<!-- ============ TAB 4: COMPARE ============ -->\r\n  <div class="tab-panel" id="tabCompare">', playerHTML);

// 3. Panels object
replaceOnce(
  "enemies: document.getElementById('tabEnemies'),\r\n    compare: document.getElementById('tabCompare'),",
  "enemies: document.getElementById('tabEnemies'),\r\n    players: document.getElementById('tabPlayers'),\r\n    compare: document.getElementById('tabCompare'),"
);

// 4. tabLabels
replaceOnce(
  "const tabLabels = { dice: '\u{1F3B2} Tirar Dados', calc: '\u{1F9EE} Calculadora', enemies: '\u2694\uFE0F Enemigos', compare: '\u2696\uFE0F Comparar' };",
  "const tabLabels = { dice: '\u{1F3B2} Tirar Dados', calc: '\u{1F9EE} Calculadora', enemies: '\u2694\uFE0F Enemigos', players: '\u{1F6E1}\uFE0F Jugadores', compare: '\u2696\uFE0F Comparar' };"
);

// 5. Rename ENEMY_EFFECTS to ENTITY_EFFECTS
c = c.split('ENEMY_EFFECTS').join('ENTITY_EFFECTS');
console.log('Renamed ENEMY_EFFECTS to ENTITY_EFFECTS');

// 6. Rename getEnemyDamageMultiplier to getEntityDamageMultiplier
// Only the function definition and calls, not variable names
c = c.split('getEnemyDamageMultiplier(enemy)').join('getEntityDamageMultiplier(enemy)');
c = c.split('getEnemyDamageMultiplier(enemy) {\r\n').join('getEntityDamageMultiplier(entity) {\r\n');
console.log('Renamed damage multiplier function');

// 7. Player JS code - insert before COMPARISON section
const playerJS =
'\r\n' +
'  // ============================================================\r\n' +
'  //  PLAYER TRACKER\r\n' +
'  // ============================================================\r\n' +
'\r\n' +
'  let players = [];\r\n' +
'  let playerIdCounter = 0;\r\n' +
'\r\n' +
'  const playerNameInput = document.getElementById(\'playerName\');\r\n' +
'  const playerHpInput = document.getElementById(\'playerHp\');\r\n' +
'  const playerStaggerInput = document.getElementById(\'playerStagger\');\r\n' +
'  const playerAddBtn = document.getElementById(\'playerAddBtn\');\r\n' +
'  const playerList = document.getElementById(\'playerList\');\r\n' +
'\r\n' +
'  function addPlayer(name, maxHp, maxStagger) {\r\n' +
'    const id = ++playerIdCounter;\r\n' +
'    players.push({ id, name: name.trim() || \'Jugador \' + id, maxHp, currentHp: maxHp, maxStagger, currentStagger: maxStagger, statuses: { damageUp: 0, damageDown: 0, protection: 0, fragile: 0 } });\r\n' +
'    renderPlayers();\r\n' +
'    saveState();\r\n' +
'  }\r\n' +
'\r\n' +
'  function removePlayer(id) {\r\n' +
'    const card = document.querySelector(`.player-card[data-id="${id}"]`);\r\n' +
'    if (card) { card.classList.add(\'removing\'); setTimeout(() => { players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }, 250); }\r\n' +
'    else { players = players.filter(e => e.id !== id); renderPlayers(); saveState(); }\r\n' +
'  }\r\n' +
'\r\n' +
'  function damagePlayer(id, amount, type) {\r\n' +
'    const player = players.find(e => e.id === id);\r\n' +
'    if (!player) return;\r\n' +
'    let dmg = Math.max(0, Math.floor(amount));\r\n' +
'    if (dmg === 0) return;\r\n' +
'    if (type !== \'stagger\') { dmg = Math.round(dmg * getEntityDamageMultiplier(player)); if (dmg < 1 && amount > 0) dmg = 1; }\r\n' +
'    if (type === \'stagger\') { player.currentStagger = Math.max(0, player.currentStagger - dmg); }\r\n' +
'    else { player.currentHp = Math.max(0, player.currentHp - dmg); player.currentStagger = Math.max(0, player.currentStagger - dmg); }\r\n' +
'    if (player.currentHp <= 0) { removePlayer(id); }\r\n' +
'    else { renderPlayers(); saveState(); }\r\n' +
'  }\r\n' +
'\r\n' +
'  function renderPlayers() {\r\n' +
'    if (players.length === 0) { playerList.innerHTML = \'<div class="enemy-empty">No hay jugadores. Agreg\u00e1 uno arriba.</div>\'; return; }\r\n' +
'    let html = \'\';\r\n' +
'    players.forEach(e => {\r\n' +
'      const hpPct = Math.max(0, (e.currentHp / e.maxHp) * 100);\r\n' +
'      const staggerPct = Math.max(0, (e.currentStagger / e.maxStagger) * 100);\r\n' +
'      html += `\r\n' +
'        <div class="player-card enemy-card" data-id="${e.id}">\r\n' +
'          <div class="enemy-card-header">\r\n' +
'            <span class="enemy-name">${escapeHtml(e.name)}</span>\r\n' +
'            <div class="enemy-card-actions">\r\n' +
'              <button class="enemy-delete-btn" onclick="removePlayer(${e.id})" title="Eliminar">\u2715</button>\r\n' +
'              <button class="enemy-delete-btn" onclick="showPlayerHealInput(${e.id})" title="Curar" style="color:#4a9a5a;background:transparent">+</button>\r\n' +
'            </div>\r\n' +
'          </div>\r\n' +
'          <div class="enemy-bar-section">\r\n' +
'            <div class="enemy-bar-label"><span class="label" style="color:#4a9a5a">Hp</span><span class="value">${e.currentHp} / ${e.maxHp}</span></div>\r\n' +
'            <div class="enemy-bar-track" onclick="showPlayerDamageInput(${e.id}, \'hp\')"><div class="enemy-bar-fill hp" style="width:${hpPct}%"></div></div>\r\n' +
'            <div class="enemy-damage-input" id="p-hpDmg-${e.id}">\r\n' +
'              <input type="number" id="p-hpField-${e.id}" value="1" min="1" placeholder="Da\u00f1o a Hp">\r\n' +
'              <button class="btn-damage-apply" onclick="applyPlayerDamage(${e.id}, \'hp\')">Aplicar</button>\r\n' +
'            </div>\r\n' +
'          </div>\r\n' +
'          <div class="enemy-bar-section">\r\n' +
'            <div class="enemy-bar-label"><span class="label" style="color:#d4a017">Stagger</span><span class="value">${e.currentStagger} / ${e.maxStagger}</span></div>\r\n' +
'            <div class="enemy-bar-track" onclick="showPlayerDamageInput(${e.id}, \'stagger\')"><div class="enemy-bar-fill stagger" style="width:${staggerPct}%"></div></div>\r\n' +
'            <div class="enemy-damage-input" id="p-staggerDmg-${e.id}">\r\n' +
'              <input type="number" id="p-staggerField-${e.id}" value="1" min="1" placeholder="Da\u00f1o a Stagger">\r\n' +
'              <button class="btn-damage-apply" onclick="applyPlayerDamage(${e.id}, \'stagger\')">Aplicar</button>\r\n' +
'            </div>\r\n' +
'            <div class="enemy-damage-input" id="p-staggerHealInput-${e.id}">\r\n' +
'              <input type="number" id="p-staggerHealField-${e.id}" value="1" min="1" placeholder="Curar Stagger">\r\n' +
'              <button class="btn-damage-apply" onclick="applyPlayerStaggerHeal(${e.id})" style="background:linear-gradient(135deg,#7a4a00,#b8860b)">Curar</button>\r\n' +
'            </div>\r\n' +
'          </div>\r\n' +
'          <div class="enemy-damage-input" id="p-healInput-${e.id}">\r\n' +
'            <input type="number" id="p-healField-${e.id}" value="1" min="1" placeholder="Cantidad a curar">\r\n' +
'            <button class="btn-damage-apply" onclick="applyPlayerHeal(${e.id})" style="background:linear-gradient(135deg,#1a5c2a,#4a9a5a)">Curar</button>\r\n' +
'          </div>\r\n' +
'          <div class="enemy-status-section">\r\n' +
'            <div class="enemy-status-badges">\r\n' +
'              ${ENTITY_EFFECTS.map(eff => `\r\n' +
'                <div class="enemy-status-badge">\r\n' +
'                  <span class="es-left" onclick="changePlayerStatus(${e.id}, \'${eff.id}\', -1)"><span class="es-arrow">\u25C0</span></span>\r\n' +
'                  <img src="${eff.icon}" alt="${eff.name}" class="es-icon">\r\n' +
'                  <span class="es-count">${e.statuses[eff.id] || 0}</span>\r\n' +
'                  <span class="es-right" onclick="changePlayerStatus(${e.id}, \'${eff.id}\', 1)"><span class="es-arrow">\u25B6</span></span>\r\n' +
'                </div>\r\n' +
'              `).join(\'\')}\r\n' +
'            </div>\r\n' +
'          </div>\r\n' +
'        </div>`;\r\n' +
'    });\r\n' +
'    playerList.innerHTML = html;\r\n' +
'  }\r\n' +
'\r\n' +
'  function changePlayerStatus(id, effectId, delta) {\r\n' +
'    const player = players.find(e => e.id === id);\r\n' +
'    if (!player) return;\r\n' +
'    player.statuses[effectId] = Math.max(0, Math.min(10, (player.statuses[effectId] || 0) + delta));\r\n' +
'    renderPlayers();\r\n' +
'    saveState();\r\n' +
'  }\r\n' +
'\r\n' +
'  function showPlayerDamageInput(id, type) {\r\n' +
'    document.querySelectorAll(\'.enemy-damage-input\').forEach(inp => inp.classList.remove(\'visible\'));\r\n' +
'    const el = document.getElementById(\'p-\' + type + \'Dmg-\' + id);\r\n' +
'    if (!el) return;\r\n' +
'    el.classList.add(\'visible\');\r\n' +
'    const field = document.getElementById(\'p-\' + type + \'Field-\' + id);\r\n' +
'    if (field) { field.focus(); field.select(); }\r\n' +
'  }\r\n' +
'\r\n' +
'  function applyPlayerDamage(id, type) {\r\n' +
'    const amt = parseInt(document.getElementById(\'p-\' + type + \'Field-\' + id)?.value) || 1;\r\n' +
'    damagePlayer(id, amt, type);\r\n' +
'    const el = document.getElementById(\'p-\' + type + \'Dmg-\' + id);\r\n' +
'    if (el) el.classList.remove(\'visible\');\r\n' +
'  }\r\n' +
'\r\n' +
'  function healPlayerStagger(id, amount) {\r\n' +
'    const p = players.find(e => e.id === id);\r\n' +
'    if (!p) return;\r\n' +
'    const heal = Math.max(0, Math.floor(amount));\r\n' +
'    if (heal === 0) return;\r\n' +
'    p.currentStagger = Math.min(p.maxStagger, p.currentStagger + heal);\r\n' +
'    renderPlayers();\r\n' +
'    saveState();\r\n' +
'  }\r\n' +
'\r\n' +
'  function showPlayerStaggerHealInput(id) {\r\n' +
'    document.querySelectorAll(\'.enemy-damage-input\').forEach(inp => inp.classList.remove(\'visible\'));\r\n' +
'    const el = document.getElementById(\'p-staggerHealInput-\' + id);\r\n' +
'    if (!el) return;\r\n' +
'    el.classList.add(\'visible\');\r\n' +
'    const f = document.getElementById(\'p-staggerHealField-\' + id);\r\n' +
'    if (f) { f.focus(); f.select(); }\r\n' +
'  }\r\n' +
'\r\n' +
'  function applyPlayerStaggerHeal(id) {\r\n' +
'    const amt = parseInt(document.getElementById(\'p-staggerHealField-\' + id)?.value) || 1;\r\n' +
'    healPlayerStagger(id, amt);\r\n' +
'    const el = document.getElementById(\'p-staggerHealInput-\' + id);\r\n' +
'    if (el) el.classList.remove(\'visible\');\r\n' +
'  }\r\n' +
'\r\n' +
'  function showPlayerHealInput(id) {\r\n' +
'    document.querySelectorAll(\'.enemy-damage-input\').forEach(inp => inp.classList.remove(\'visible\'));\r\n' +
'    const el = document.getElementById(\'p-healInput-\' + id);\r\n' +
'    if (!el) return;\r\n' +
'    el.classList.add(\'visible\');\r\n' +
'    const f = document.getElementById(\'p-healField-\' + id);\r\n' +
'    if (f) { f.focus(); f.select(); }\r\n' +
'  }\r\n' +
'\r\n' +
'  function healPlayer(id, amount) {\r\n' +
'    const p = players.find(e => e.id === id);\r\n' +
'    if (!p) return;\r\n' +
'    const heal = Math.max(0, Math.floor(amount));\r\n' +
'    if (heal === 0) return;\r\n' +
'    p.currentHp = Math.min(p.maxHp, p.currentHp + heal);\r\n' +
'    renderPlayers();\r\n' +
'    saveState();\r\n' +
'  }\r\n' +
'\r\n' +
'  function applyPlayerHeal(id) {\r\n' +
'    const amt = parseInt(document.getElementById(\'p-healField-\' + id)?.value) || 1;\r\n' +
'    healPlayer(id, amt);\r\n' +
'    const el = document.getElementById(\'p-healInput-\' + id);\r\n' +
'    if (el) el.classList.remove(\'visible\');\r\n' +
'  }\r\n' +
'\r\n' +
'  playerAddBtn.addEventListener(\'click\', () => {\r\n' +
'    const name = playerNameInput.value || \'Jugador\';\r\n' +
'    const hp = parseInt(playerHpInput.value) || 100;\r\n' +
'    const stagger = parseInt(playerStaggerInput.value) || 50;\r\n' +
'    if (hp < 1 || stagger < 1) return;\r\n' +
'    addPlayer(name, hp, stagger);\r\n' +
'    playerNameInput.value = \'\';\r\n' +
'    playerNameInput.focus();\r\n' +
'  });\r\n' +
'\r\n' +
'  playerNameInput.addEventListener(\'keydown\', (e) => { if (e.key === \'Enter\') playerAddBtn.click(); });\r\n' +
'\r\n' +
'  document.addEventListener(\'keydown\', (e) => {\r\n' +
'    if (!panels.players.classList.contains(\'active\')) return;\r\n' +
'    if (e.key === \'Enter\') {\r\n' +
'      const a = document.activeElement;\r\n' +
'      if (!a) return;\r\n' +
'      if (a.id.startsWith(\'p-hpField-\')) { applyPlayerDamage(parseInt(a.id.replace(\'p-hpField-\', \'\')), \'hp\'); }\r\n' +
'      else if (a.id.startsWith(\'p-staggerField-\')) { applyPlayerDamage(parseInt(a.id.replace(\'p-staggerField-\', \'\')), \'stagger\'); }\r\n' +
'      else if (a.id.startsWith(\'p-staggerHealField-\')) { applyPlayerStaggerHeal(parseInt(a.id.replace(\'p-staggerHealField-\', \'\'))); }\r\n' +
'      else if (a.id.startsWith(\'p-healField-\')) { applyPlayerHeal(parseInt(a.id.replace(\'p-healField-\', \'\'))); }\r\n' +
'    }\r\n' +
'  });\r\n';
insertBefore('  // ============================================================\r\n  //  COMPARISON / CLASH', playerJS);

// 8. Update saveState + loadState for players
// Save players
const savePlayers = "localStorage.setItem('diceTool_enemyId', String(enemyIdCounter));\r\n    localStorage.setItem('diceTool_players', JSON.stringify(players));\r\n    localStorage.setItem('diceTool_playerId', String(playerIdCounter));\r\n    if (lastRawTotal !== null) {";
replaceOnce(
  "localStorage.setItem('diceTool_enemyId', String(enemyIdCounter));\r\n    if (lastRawTotal !== null) {",
  savePlayers
);

// Load players
const loadPlayers = "    const savedEnemies = localStorage.getItem('diceTool_enemies');\r\n    if (savedEnemies) {\r\n      try {\r\n        enemies = JSON.parse(savedEnemies);\r\n        const savedEnemyId = localStorage.getItem('diceTool_enemyId');\r\n        if (savedEnemyId !== null) enemyIdCounter = parseInt(savedEnemyId) || 0;\r\n        renderEnemies();\r\n      } catch (e) { /* ignore */ }\r\n    }\r\n\r\n    const savedPlayers = localStorage.getItem('diceTool_players');\r\n    if (savedPlayers) {\r\n      try {\r\n        players = JSON.parse(savedPlayers);\r\n        const savedPlayerId = localStorage.getItem('diceTool_playerId');\r\n        if (savedPlayerId !== null) playerIdCounter = parseInt(savedPlayerId) || 0;\r\n        renderPlayers();\r\n      } catch (e) { /* ignore */ }\r\n    }\r\n\r\n    const savedRoll = localStorage.getItem('diceTool_lastRoll');";
replaceOnce(
  "    const savedEnemies = localStorage.getItem('diceTool_enemies');\r\n    if (savedEnemies) {\r\n      try {\r\n        enemies = JSON.parse(savedEnemies);\r\n        const savedEnemyId = localStorage.getItem('diceTool_enemyId');\r\n        if (savedEnemyId !== null) enemyIdCounter = parseInt(savedEnemyId) || 0;\r\n        renderEnemies();\r\n      } catch (e) { /* ignore */ }\r\n    }\r\n\r\n    const savedRoll = localStorage.getItem('diceTool_lastRoll');",
  loadPlayers
);

// 9. Add default player
replaceOnce(
  "    if (enemies.length === 0) {\r\n      addEnemy('Carnicero', 150, 60);\r\n    }\r\n  }, 100);",
  "    if (enemies.length === 0) {\r\n      addEnemy('Carnicero', 150, 60);\r\n    }\r\n    if (players.length === 0) {\r\n      addPlayer('Roland', 120, 50);\r\n    }\r\n  }, 100);"
);

// Also rename the function parameter: (enemy) -> (entity) in getEntityDamageMultiplier
// But first, need to handle the function definition which has `getEnemyDamageMultiplier(enemy) {`
// Already changed above, but let me also fix the param name for clarity
c = c.split('function getEntityDamageMultiplier(entity) {\r\n').join('function getEntityDamageMultiplier(entity) {\r\n');

console.log('Total changes:', ch);
fs.writeFileSync(path, c, 'utf8');
console.log('File saved!');
