  // ============================================================
  //  COMPARISON / CLASH
  // ============================================================

  const compAllyInput = document.getElementById('compAlly');
  const compEnemyInput = document.getElementById('compEnemy');
  const compBtn = document.getElementById('compBtn');
  const compResult = document.getElementById('compResult');

  function doCompare() {
    const ally = parseInt(compAllyInput.value) || 0;
    const enemy = parseInt(compEnemyInput.value) || 0;

    if (ally === 0 && enemy === 0) {
      compResult.innerHTML = '<div class="comp-detail">Poné los dos números y toca Comparar</div>';
      return;
    }

    const diff = Math.abs(ally - enemy);
    let winnerClass, winnerText, detailText;

    if (ally > enemy) {
      winnerClass = 'ally';
      winnerText = '✅ Aliado gana';
      detailText = `Gana por ${diff}`;
    } else if (enemy > ally) {
      winnerClass = 'enemy';
      winnerText = '❌ Enemigo gana';
      detailText = `Gana por ${diff}`;
    } else {
      winnerClass = 'tie';
      winnerText = '⚖️ Empate';
      detailText = 'Mismo valor';
    }

    compResult.innerHTML = `
      <div class="comp-winner ${winnerClass}">${winnerText}</div>
      <div class="comp-diff">${detailText}</div>
      <div class="comp-detail">${ally} vs ${enemy}</div>
    `;
  }

  function sendToCompare(target) {
    if (lastRollTotal === null) return;
    if (target === 'ally') {
      compAllyInput.value = lastRollTotal;
    } else {
      compEnemyInput.value = lastRollTotal;
    }
    document.querySelector('.tab-btn[data-tab="compare"]').click();
    doCompare();
  }

  compBtn.addEventListener('click', doCompare);

  document.addEventListener('keydown', (e) => {
    if (!panels.compare.classList.contains('active')) return;
    if (e.key === 'Enter') doCompare();
  });
