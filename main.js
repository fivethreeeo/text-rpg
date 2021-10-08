'use-strict';

const $startScreen = document.querySelector('#start-screen');
const $gameMenu = document.querySelector('#game-menu');
const $battleMenu = document.querySelector('#battle-menu');
const $startScreenInput = document.querySelector('#start-screen input');
const $battleMenuInput = document.querySelector('#battle-menu input');
const $gameMenuInput = document.querySelector('#game-menu input');
const $heroName = document.querySelector('#hero-name');
const $heroLevel = document.querySelector('#hero-level');
const $heroHp = document.querySelector('#hero-hp');
const $heroXp = document.querySelector('#hero-xp');
const $heroAtt = document.querySelector('#hero-att');
const $monsterName = document.querySelector('#monster-name');
const $monsterHp = document.querySelector('#monster-hp');
const $monsterAtt = document.querySelector('#monster-att');
const $message = document.querySelector('#message');

class Game {
  constructor(name) {
    this.monster = null;
    this.hero = null;
    this.monsterList = [
      { name: '팀장', hp: 25, att: 10, xp: 10 },
      { name: 'COO', hp: 50, att: 15, xp: 20 },
      { name: 'CEO', hp: 150, att: 35, xp: 50 },
    ];
    this.start(name);
  }

  start(name) {
    $gameMenu.addEventListener('submit', this.onGameMenuInput);
    $battleMenu.addEventListener('submit', this.onBattleMenuInput);
    this.changeScreen('game');
    this.hero = new Hero(this, name);
    this.updateHeroStat();
  }

  quit() {
    this.hero = null;
    this.monster = null;
    this.updateHeroStat();
    this.updateMonsterStat();
    $gameMenu.removeEventListener('submit', this.onGameMenuInput);
    $battleMenu.removeEventListener('submit', this.onBattleMenuInput);
    this.changeScreen('start');
    game = null;
  }

  changeScreen(screen) {
    if (screen === 'start') {
      $startScreen.style.display = 'block';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'none';
      this.inputReset($startScreenInput);
    } else if (screen === 'game') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'block';
      $battleMenu.style.display = 'none';
      this.inputReset($gameMenuInput);
    } else if (screen === 'battle') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'block';
      this.inputReset($battleMenuInput);
    }
  }

  inputReset(inputTag) {
    inputTag.value = '';
    inputTag.focus();
  }

  updateHeroStat() {
    const { hero } = this;
    if (hero === null) {
      $heroName.textContent = '';
      $heroLevel.textContent = '';
      $heroHp.textContent = '';
      $heroXp.textContent = '';
      $heroAtt.textContent = '';
      return;
    }
    $heroName.textContent = hero.name;
    $heroLevel.textContent = `${hero.lev}Lev`;
    $heroHp.textContent = `HP: ${hero.hp}/${hero.maxHp}`;
    $heroXp.textContent = `XP: ${hero.xp}/${15 * hero.lev}`;
    $heroAtt.textContent = `ATT: ${hero.att}`;
  }

  updateMonsterStat() {
    const { monster } = this;
    if (monster === null) {
      $monsterName.textContent = '';
      $monsterHp.textContent = '';
      $monsterAtt.textContent = '';
      return;
    }
    $monsterName.textContent = monster.name;
    $monsterHp.textContent = `HP: ${monster.hp}/${monster.maxHp}`;
    $monsterAtt.textContent = `ATT: ${monster.att}`;
  }

  showMessage(text) {
    $message.textContent = text;
  }

  onGameMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['menu-input'].value;

    if (input === '1') {
      // 모험
      this.changeScreen('battle');

      const randomIndex = Math.floor(Math.random() * this.monsterList.length);
      const randomMonster = this.monsterList[randomIndex];
      this.monster = new Monster(
        this,
        randomMonster.name,
        randomMonster.hp,
        randomMonster.att,
        randomMonster.xp
      );

      this.updateMonsterStat();
      this.showMessage(`몬스터와 마주쳤다. ${this.monster.name}인 것 같다.`);
    } else if (input === '2') {
      // 휴식
      this.hero.hp = this.hero.maxHp;
      this.updateHeroStat();
      this.showMessage(`체력을 모두 회복했다.`);
    } else if (input === '3') {
      // 종료
      this.quit();
      this.showMessage(`게임을 종료했습니다.`);
    }
    console.log(game);
  };

  onBattleMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['battle-input'].value;

    const { hero, monster } = this;

    if (input === '1') {
      // 공격
      hero.attack(monster);
      monster.attack(hero);

      if (hero.hp <= 0) {
        this.showMessage(`${hero.name}은 과도한 스트레스로 사망하였다...`);
        this.quit();
      } else if (monster.hp <= 0) {
        this.showMessage(`${monster.name}을 잡아 경험치를 얻었다!`);
        hero.getXp(monster.xp);
        this.monster = null;
        this.changeScreen('game');
      } else {
        this.showMessage(
          `${hero.att}의 데미지를 주고, ${monster.att}의 데미지를 받았다.`
        );
      }
      this.updateHeroStat();
      this.updateMonsterStat();
    } else if (input === '2') {
      // 회복
      const healAmount = Math.min(20, hero.maxHp - hero.hp);
      hero.hp += healAmount;
      monster.attack(hero);
      if (hero.hp <= 0) {
        this.showMessage(`${hero.name}은 과도한 스트레스로 사망하였다...`);
        this.quit();
        return;
      }
      this.showMessage(
        `체력을 ${healAmount} 회복하고, ${monster.att}의 데미지를 받았다.`
      );
      this.updateHeroStat();
    } else if (input === '3') {
      // 도망
      this.showMessage(`${monster.name}를 피해 무사히 도망쳤다.`);
      this.monster = null;
      this.updateMonsterStat();
      this.changeScreen('game');
    }
    console.log(game);
  };
}

class Unit {
  constructor(game, name, hp, att, xp) {
    this.game = game;
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.att = att;
    this.xp = xp;
  }
  attack(target) {
    target.hp -= this.att;
  }
}

class Hero extends Unit {
  constructor(game, name) {
    super(game, name, 100, 10, 0);
    this.lev = 1;
  }

  heal() {
    const damage = this.maxHp - this.hp;
    if (damage < 20) {
      this.healMax();
      return;
    }
    this.hp += 20;
  }

  getXp(xp) {
    this.xp += xp;
    if (this.xp >= this.lev * 15) {
      this.xp -= this.lev * 15;
      this.lev += 1;
      this.maxHp += 5;
      this.att += 5;
      this.hp = this.maxHp;
      this.game.showMessage(`레벨업! 레벨${this.lev}`);
    }
  }
}

// 몬스터
class Monster extends Unit {
  constructor(game, name, hp, att, xp) {
    super(game, name, hp, att, xp);
  }
}

// 페이지 로드
let game = null;
$startScreenInput.focus();

$startScreen.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = event.target['name-input'].value;
  game = new Game(name);
  console.log(game);
});
