  // ============================================================
  //  ENEMY TRACKER
  // ============================================================

  let enemies = [];
  let enemyIdCounter = 0;

  const enemyNameInput = document.getElementById('enemyName');
  const enemyHpInput = document.getElementById('enemyHp');
  const enemyStaggerInput = document.getElementById('enemyStagger');
  const enemyAddBtn = document.getElementById('enemyAddBtn');
  const enemyList = document.getElementById('enemyList');

  function addEnemy(name, maxHp, maxStagger) {
    const id = ++enemyIdCounter;
    enemies.push({
      id,
      name: name.trim() || 'Enemigo ' + id,
      maxHp,
      currentHp: maxHp,
      maxStagger,
      currentStagger: maxStagger,
      statuses: { damageUp: 0, damageDown: 0, protection: 0, fragile: 0 },
    });
    renderEnemies();
    saveState();
  }

  function removeEnemy(id) {
    const card = document.querySelector(`.enemy-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        enemies = enemies.filter(e => e.id !== id);
        renderEnemies();
        saveState();
      }, 250);
    } else {
      enemies = enemies.filter(e => e.id !== id);
      renderEnemies();
      saveState();
    }
  }

  function damageEnemy(id, amount, type) {
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;
    let dmg = Math.max(0, Math.floor(amount));
    if (dmg === 0) return;

    if (type !== 'stagger') {
      var _crit = poiseTryCritDamage('enemy');
      if (_crit.isCrit) dmg = dmg * _crit.multiplier;
      dmg = Math.round(dmg * getEntityDamageMultiplier(enemy));
      if (dmg < 1 && amount > 0) dmg = 1;
    }

    if (type === 'stagger') {
      enemy.currentStagger = Math.max(0, enemy.currentStagger - dmg);
    } else {
      enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
      enemy.currentStagger = Math.max(0, enemy.currentStagger - dmg);
    }

    if (enemy.currentHp <= 0) {
      removeEnemy(id);
    } else {
      renderEnemies();
      saveState();
    }
  }

  function renderEnemies() {
    if (enemies.length === 0) {
      enemyList.innerHTML = '<div class="enemy-empty">No hay enemigos. Agregá uno arriba.</div>';
      return;
    }

    let html = '';
    enemies.forEach(e => {
      const hpPct = Math.max(0, (e.currentHp / e.maxHp) * 100);
      const staggerPct = Math.max(0, (e.currentStagger / e.maxStagger) * 100);

      html += `
        <div class="enemy-card" data-id="${e.id}">
          <div class="enemy-card-header">
            <span class="enemy-name">${escapeHtml(e.name)}</span>
            <div class="enemy-card-actions">
              <button class="enemy-delete-btn" onclick="removeEnemy(${e.id})" title="Eliminar">✕</button>
              <button class="enemy-delete-btn" onclick="showHealInput(${e.id})" title="Curar" style="color:#4a9a5a;background:transparent">+</button>
            </div>
          </div>

          <div class="enemy-bar-section">
            <div class="enemy-bar-label">
              <span class="label" style="color:#4a9a5a">Hp</span>
              <span class="value">${e.currentHp} / ${e.maxHp}</span>
            </div>
            <div class="enemy-bar-track" onclick="showDamageInput(${e.id}, 'hp')">
              <div class="enemy-bar-fill hp" style="width:${hpPct}%"></div>
            </div>
            <div class="enemy-damage-input" id="hpDmg-${e.id}">
              <input type="number" id="hpField-${e.id}" value="1" min="1" placeholder="Daño a Hp">
              <button class="btn-damage-apply" onclick="applyDamage(${e.id}, 'hp')">Aplicar</button>
            </div>
          </div>

          <div class="enemy-bar-section">
            <div class="enemy-bar-label">
              <span class="label" style="color:#d4a017">Stagger</span>
              <span class="value">${e.currentStagger} / ${e.maxStagger}
                <button class="enemy-delete-btn" onclick="showStaggerHealInput(${e.id})" title="Curar Stagger" style="color:#d4a017;background:transparent;font-size:13px;margin-left:4px;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer">+</button>
              </span>
            </div>
            <div class="enemy-bar-track" onclick="showDamageInput(${e.id}, 'stagger')">
              <div class="enemy-bar-fill stagger" style="width:${staggerPct}%"></div>
            </div>
            <div class="enemy-damage-input" id="staggerDmg-${e.id}">
              <input type="number" id="staggerField-${e.id}" value="1" min="1" placeholder="Daño a Stagger">
              <button class="btn-damage-apply" onclick="applyDamage(${e.id}, 'stagger')">Aplicar</button>
            </div>
            <div class="enemy-damage-input" id="staggerHealInput-${e.id}">
              <input type="number" id="staggerHealField-${e.id}" value="1" min="1" placeholder="Curar Stagger">
              <button class="btn-damage-apply" onclick="applyStaggerHeal(${e.id})" style="background:linear-gradient(135deg,#7a4a00,#b8860b)">Curar</button>
            </div>
          </div>

          <div class="enemy-damage-input" id="healInput-${e.id}">
            <input type="number" id="healField-${e.id}" value="1" min="1" placeholder="Cantidad a curar">
            <button class="btn-damage-apply" onclick="applyHeal(${e.id})" style="background:linear-gradient(135deg,#1a5c2a,#4a9a5a)">Curar</button>
          </div>

          <div class="enemy-status-section">
            <div class="enemy-status-badges">
              ${ENTITY_EFFECTS.map(eff => `
                <div class="enemy-status-badge">
                  <span class="es-left" onclick="changeEnemyStatus(${e.id}, '${eff.id}', -1)"><span class="es-arrow">◀</span></span>
                  <img src="${eff.icon}" alt="${eff.name}" class="es-icon">
                  <span class="es-count">${e.statuses[eff.id] || 0}</span>
                  <span class="es-right" onclick="changeEnemyStatus(${e.id}, '${eff.id}', 1)"><span class="es-arrow">▶</span></span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    });

    enemyList.innerHTML = html;
  }

  const ENTITY_EFFECTS = [
    { id: 'damageUp',   name: 'Daño +',  icon: 'https://limbuscompany.wiki.gg/images/thumb/Damage_Up.png/25px-Damage_Up.png?e8dfcd' },
    { id: 'damageDown', name: 'Daño −',  icon: 'https://limbuscompany.wiki.gg/images/thumb/Damage_Down.png/25px-Damage_Down.png?99c357' },
    { id: 'protection', name: 'Prot.',   icon: 'https://limbuscompany.wiki.gg/images/thumb/Protection.png/25px-Protection.png?bd9ff7' },
    { id: 'fragile',    name: 'Frágil',  icon: 'https://limbuscompany.wiki.gg/images/thumb/Fragile.png/25px-Fragile.png?7c6083' },
  ];

  function changeEnemyStatus(id, effectId, delta) {
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;
    const cur = enemy.statuses[effectId] || 0;
    enemy.statuses[effectId] = Math.max(0, Math.min(10, cur + delta));
    renderEnemies();
    saveState();
  }

  function getEntityDamageMultiplier(enemy) {
    let mult = 1;
    mult += 0.1 * (enemy.statuses.fragile || 0);
    mult += 0.1 * (enemy.statuses.damageUp || 0);
    mult -= 0.1 * (enemy.statuses.protection || 0);
    mult -= 0.1 * (enemy.statuses.damageDown || 0);
    return Math.max(0.05, mult);
  }

  function showDamageInput(id, type) {
    const el = document.getElementById(type + 'Dmg-' + id);
    if (!el) return;
    const wasVisible = el.classList.contains('visible');
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    if (!wasVisible) {
      el.classList.add('visible');
      const field = document.getElementById(type + 'Field-' + id);
      if (field) { field.focus(); field.select(); }
    }
  }

  function applyDamage(id, type) {
    const field = document.getElementById(type + 'Field-' + id);
    const amount = parseInt(field?.value) || 1;
    damageEnemy(id, amount, type);
    const el = document.getElementById(type + 'Dmg-' + id);
    if (el) el.classList.remove('visible');
  }

  function healStagger(id, amount) {
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;
    const heal = Math.max(0, Math.floor(amount));
    if (heal === 0) return;
    enemy.currentStagger = Math.min(enemy.maxStagger, enemy.currentStagger + heal);
    renderEnemies();
    saveState();
  }

  function showStaggerHealInput(id) {
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    const el = document.getElementById('staggerHealInput-' + id);
    if (!el) return;
    el.classList.add('visible');
    const field = document.getElementById('staggerHealField-' + id);
    if (field) { field.focus(); field.select(); }
  }

  function applyStaggerHeal(id) {
    const field = document.getElementById('staggerHealField-' + id);
    const amount = parseInt(field?.value) || 1;
    healStagger(id, amount);
    const el = document.getElementById('staggerHealInput-' + id);
    if (el) el.classList.remove('visible');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  enemyAddBtn.addEventListener('click', () => {
    const name = enemyNameInput.value || 'Enemigo';
    const hp = parseInt(enemyHpInput.value) || 100;
    const stagger = parseInt(enemyStaggerInput.value) || 50;
    if (hp < 1 || stagger < 1) return;
    addEnemy(name, hp, stagger);
    enemyNameInput.value = '';
    enemyNameInput.focus();
  });

  enemyNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enemyAddBtn.click();
  });

  function showHealInput(id) {
    document.querySelectorAll('.enemy-damage-input').forEach(inp => inp.classList.remove('visible'));
    const el = document.getElementById('healInput-' + id);
    if (!el) return;
    el.classList.add('visible');
    const field = document.getElementById('healField-' + id);
    if (field) { field.focus(); field.select(); }
  }

  function healEnemy(id, amount) {
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;
    const heal = Math.max(0, Math.floor(amount));
    if (heal === 0) return;
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + heal);
    renderEnemies();
    saveState();
  }

  function applyHeal(id) {
    const field = document.getElementById('healField-' + id);
    const amount = parseInt(field?.value) || 1;
    healEnemy(id, amount);
    const el = document.getElementById('healInput-' + id);
    if (el) el.classList.remove('visible');
  }

  document.addEventListener('keydown', (e) => {
    if (!panels.enemies.classList.contains('active')) return;
    if (e.key === 'Enter') {
      const active = document.activeElement;
      if (!active) return;
      if (active.id.startsWith('hpField-')) {
        const id = parseInt(active.id.replace('hpField-', ''));
        applyDamage(id, 'hp');
      } else if (active.id.startsWith('staggerField-')) {
        const id = parseInt(active.id.replace('staggerField-', ''));
        applyDamage(id, 'stagger');
      } else if (active.id.startsWith('staggerHealField-')) {
        const id = parseInt(active.id.replace('staggerHealField-', ''));
        applyStaggerHeal(id);
      } else if (active.id.startsWith('healField-')) {
        const id = parseInt(active.id.replace('healField-', ''));
        applyHeal(id);
      }
    }
  });
