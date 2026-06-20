  // ============================================================
  //  TABS
  // ============================================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = {
    dice: document.getElementById('tabDice'),
    calc: document.getElementById('tabCalc'),
    enemies: document.getElementById('tabEnemies'),
    players: document.getElementById('tabPlayers'),
    compare: document.getElementById('tabCompare'),
    ruleta: document.getElementById('tabRuleta'),
  };
  const tabSubtitle = document.getElementById('tabSubtitle');
  const tabLabels = { dice: '🎲 Tirar Dados', calc: '🧮 Calculadora', enemies: '⚔️ Enemigos', players: '🛡️ Jugadores', compare: '⚖️ Comparar', ruleta: '🎰 Ruleta' };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.keys(panels).forEach(k => panels[k].classList.toggle('active', k === btn.dataset.tab));
      tabSubtitle.textContent = tabLabels[btn.dataset.tab] || '';
    });
  });
