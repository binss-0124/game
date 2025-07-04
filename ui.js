// ui.js
export const ui = (() => {
  class GameUI {
    constructor() {
      // ===============================
      // 킬/데스(K/D) UI 생성 (우측 상단, 게임 스타일, 소형)
      // ===============================
      this.kdContainer = document.createElement('div');
      this.kdContainer.style.position = 'absolute';
      this.kdContainer.style.top = '18px';
      this.kdContainer.style.right = '18px';
      this.kdContainer.style.zIndex = '300';
      this.kdContainer.style.background = 'linear-gradient(135deg, #1a1a2e 80%, #23234d 100%)';
      this.kdContainer.style.borderRadius = '12px';
      this.kdContainer.style.boxShadow = '0 2px 12px #000b, 0 0 0 2px #ffec7040 inset';
      this.kdContainer.style.padding = '9px 18px 8px 18px';
      this.kdContainer.style.display = 'flex';
      this.kdContainer.style.flexDirection = 'column';
      this.kdContainer.style.alignItems = 'center';
      this.kdContainer.style.minWidth = '75px';
      this.kdContainer.style.border = '2px solid #ffec70';
      this.kdContainer.style.userSelect = 'none';

      // 타이틀 (작게)
      this.kdTitle = document.createElement('div');
      this.kdTitle.innerText = 'KILL / DEATH';
      this.kdTitle.style.color = '#ffec70';
      this.kdTitle.style.fontWeight = '900';
      this.kdTitle.style.fontSize = '12px';
      this.kdTitle.style.letterSpacing = '1px';
      this.kdTitle.style.marginBottom = '4px';
      this.kdTitle.style.textShadow = '0 1px 4px #000, 0 0 4px #ffec70cc';
      this.kdTitle.style.fontFamily = "'Orbitron', 'Arial Black', 'sans-serif'";
      this.kdContainer.appendChild(this.kdTitle);

      // K/D 수치 (작게)
      this.kdValue = document.createElement('div');
      this.kdValue.innerText = '0 / 0';
      this.kdValue.style.color = '#fff';
      this.kdValue.style.fontWeight = 'bold';
      this.kdValue.style.fontSize = '44px';
      this.kdValue.style.textShadow = '0 1px 6px #ffec70, 0 0 4px #000b';
      this.kdValue.style.letterSpacing = '2px';
      this.kdValue.style.fontFamily = "'Orbitron', 'Arial Black', 'sans-serif'";
      this.kdValue.style.padding = '0 2px';
      this.kdContainer.appendChild(this.kdValue);

      // 애니메이션 효과 (킬/데스가 변할 때 강조)
      this.kdValue.animateHighlight = () => {
        this.kdValue.style.transition = 'transform 0.15s, color 0.15s';
        this.kdValue.style.transform = 'scale(1.13)';
        this.kdValue.style.color = '#ffec70';
        setTimeout(() => {
          this.kdValue.style.transform = 'scale(1)';
          this.kdValue.style.color = '#fff';
        }, 150);
      };

      document.body.appendChild(this.kdContainer);

      // 내부 상태
      this.kills = 0;
      this.deaths = 0;
    }

    setKillsAndDeaths(kills, deaths) {
      this.kills = kills;
      this.deaths = deaths;
      this.kdValue.innerText = `${kills} / ${deaths}`;
      this.kdValue.animateHighlight();
    }

    addKill() {
      this.kills += 1;
      this.kdValue.innerText = `${this.kills} / ${this.deaths}`;
      this.kdValue.animateHighlight();
    }

    addDeath() {
      this.deaths += 1;
      this.kdValue.innerText = `${this.kills} / ${this.deaths}`;
      this.kdValue.animateHighlight();
    }

    resetKD() {
      this.kills = 0;
      this.deaths = 0;
      this.kdValue.innerText = '0 / 0';
      this.kdValue.animateHighlight();
    }
  }

  return { GameUI };
})();
