  // ============================================================
  //  POISE TRACKER (Limbus Company) - v2
  //  Potencia = crit chance (each = +5%)
  //  Contador = how many crits can trigger
  //  Only crits consume Contador
  //  Ventaja = every 10 Potencia beyond 20 = +20
  // ============================================================

  const poiseState = {
    enemy: { potencia: 0, contador: 0 },
    player: { potencia: 0, contador: 0 }
  };

  function poiseLoad() {
    try {
      ['enemy', 'player'].forEach(function(target) {
        const saved = localStorage.getItem('diceTool_poise_' + target);
        if (saved) {
          const data = JSON.parse(saved);
          poiseState[target].potencia = data.potencia || 0;
          poiseState[target].contador = data.contador || 0;
        }
      });
      poiseUpdateUI();
    } catch(e) {}
  }

  function poiseSave() {
    ['enemy', 'player'].forEach(function(target) {
      localStorage.setItem('diceTool_poise_' + target, JSON.stringify({
        potencia: poiseState[target].potencia,
        contador: poiseState[target].contador
      }));
    });
  }

  function poiseGetCritChance(target) {
    target = target || 'enemy';
    return Math.min(poiseState[target].potencia * 5, 100);
  }

  function poiseGetAdvantage(target) {
    target = target || 'enemy';
    const extra = poiseState[target].potencia - 20;
    if (extra <= 0) return 0;
    return Math.floor(extra / 10) * 20;
  }

  function poiseUpdateUI() {
    ['enemy', 'player'].forEach(function(target) {
      var suffix = target === 'player' ? 'Players' : '';
      var potEl = document.getElementById('poisePotenciaValue' + suffix);
      var cntEl = document.getElementById('poiseContadorValue' + suffix);
      if (!potEl || !cntEl) return;

      var state = poiseState[target];
      potEl.value = state.potencia;
      cntEl.value = state.contador;

      var chance = poiseGetCritChance(target);
      var advantage = poiseGetAdvantage(target);

      var critEl = document.getElementById('poiseCritValue' + suffix);
      critEl.textContent = chance + '%';
      critEl.classList.toggle('maxed', chance >= 80);

      var statsEl = document.getElementById('poiseStats' + suffix);
      if (chance >= 100 && state.potencia > 0) {
        statsEl.textContent = 'CRITICO GARANTIZADO';
        statsEl.style.color = '#ff6b6b';
      } else if (state.potencia > 0) {
        statsEl.textContent = chance + '% critico';
        statsEl.style.color = '';
      } else {
        statsEl.textContent = '0% critico';
        statsEl.style.color = '';
      }

      var advDisplay = document.getElementById('poiseAdvantageDisplay' + suffix);
      if (advantage > 0) {
        advDisplay.style.display = 'flex';
        document.getElementById('poiseAdvValue' + suffix).textContent = '+' + advantage;
      } else {
        advDisplay.style.display = 'none';
      }
    });

    poiseSave();
  }

  function poiseTryCritDamage(target) {
    target = target || 'enemy';
    var state = poiseState[target];
    if (state.potencia <= 0 || state.contador <= 0) {
      return { multiplier: 1, isCrit: false };
    }
    const chance = poiseGetCritChance(target);
    const roll = Math.random() * 100;
    const isCrit = roll <= chance || (chance >= 100 && state.potencia > 0);
    
    if (isCrit) {
      state.contador = Math.max(0, state.contador - 1);
      if (state.contador === 0 && state.potencia > 0) {
        state.potencia = 0;
      }
      poiseUpdateUI();
      var adv = poiseGetAdvantage(target);
      var msg = 'DAMAGE CRITICO! (tirada: ' + roll.toFixed(1) + '% <= ' + chance + '%)';
      msg += ' | Danio x2.0';
      if (state.contador === 0) msg += ' | Poise perdido!';
      if (adv > 0) msg += ' | Ventaja +' + adv;
      poiseLogEntry(msg, 'crit', target);
      showCritDialog(adv);
      return { multiplier: 2, isCrit: true };
    }
    return { multiplier: 1, isCrit: false };
  }

  function poiseAddPotencia(amount, target) {
    target = target || 'enemy';
    poiseState[target].potencia = Math.max(0, poiseState[target].potencia + amount);
    var sign = amount > 0 ? '+' : '';
    poiseLogEntry(sign + amount + ' Potencia (total: ' + poiseState[target].potencia + ', ' + poiseGetCritChance(target) + '%)', 'info', target);
    poiseUpdateUI();
  }

  function poiseAddContador(amount, target) {
    target = target || 'enemy';
    poiseState[target].contador = Math.max(0, poiseState[target].contador + amount);
    var sign = amount > 0 ? '+' : '';
    poiseLogEntry(sign + amount + ' Contador (total: ' + poiseState[target].contador + ')', 'info', target);
    poiseUpdateUI();
  }

  function showCritDialog(advantage) {
    var overlay = document.createElement('div');
    overlay.className = 'crit-overlay';
    overlay.id = 'critOverlay';

    var advHtml = '';
    if (advantage > 0) {
      advHtml = '<div class="crit-sub" style="color:#4a9a5a">+ Ventaja ' + advantage + '</div>';
    }

    overlay.innerHTML =
      '<div class="crit-dialog">' +
        '<div class="crit-title">CRITICO</div>' +
        '<div class="crit-sub">Golpe perfecto!</div>' +
        '<div class="crit-dmg">x2.0</div>' +
        advHtml +
        '<button class="crit-close-btn" onclick="closeCritDialog()">Continuar</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeCritDialog();
    });

    setTimeout(function() {
      var el = document.getElementById('critOverlay');
      if (el) el.remove();
    }, 4000);
  }

  function closeCritDialog() {
    var el = document.getElementById('critOverlay');
    if (el) el.remove();
  }

  function poiseEndTurn(target) {
    target = target || 'enemy';
    var state = poiseState[target];
    if (state.contador <= 0 && state.potencia > 0) {
      poiseLogEntry('Contador en 0, Poise perdido', 'info', target);
      state.potencia = 0;
      poiseUpdateUI();
      return;
    }
    if (state.contador <= 0) {
      poiseLogEntry('No hay Contador para reducir', 'info', target);
      return;
    }
    state.contador = Math.max(0, state.contador - 1);
    poiseLogEntry('Fin del turno: -1 Contador (restante: ' + state.contador + ')', 'info', target);

    if (state.contador === 0 && state.potencia > 0) {
      state.potencia = 0;
      poiseLogEntry('Poise perdido! Sin Contador la Potencia se disipa', 'info', target);
    }

    poiseUpdateUI();
  }

  function poiseLogEntry(msg, type, target) {
    target = target || 'enemy';
    var suffix = target === 'player' ? 'Players' : '';
    var log = document.getElementById('poiseLog' + suffix);
    if (!log) return;
    var empty = log.querySelector('.poise-log-empty');
    if (empty) empty.remove();

    var entry = document.createElement('div');
    entry.className = 'poise-log-entry ' + (type || 'info');
    entry.textContent = msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }


  function poiseInitInputs() {
    ['enemy', 'player'].forEach(function(target) {
      var suffix = target === 'player' ? 'Players' : '';
      var potInput = document.getElementById('poisePotenciaValue' + suffix);
      var cntInput = document.getElementById('poiseContadorValue' + suffix);
      
      if (potInput) {
        potInput.addEventListener('input', function() {
          var val = parseInt(this.value);
          if (!isNaN(val) && val >= 0) {
            poiseState[target].potencia = val;
            poiseUpdateUI();
          }
        });
        potInput.addEventListener('blur', function() {
          if (this.value === '' || isNaN(parseInt(this.value))) {
            this.value = poiseState[target].potencia;
          }
        });
      }
      
      if (cntInput) {
        cntInput.addEventListener('input', function() {
          var val = parseInt(this.value);
          if (!isNaN(val) && val >= 0) {
            poiseState[target].contador = val;
            poiseUpdateUI();
          }
        });
        cntInput.addEventListener('blur', function() {
          if (this.value === '' || isNaN(parseInt(this.value))) {
            this.value = poiseState[target].contador;
          }
        });
      }
    });
  }
