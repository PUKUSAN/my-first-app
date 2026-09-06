const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resultElement = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const restartButton = document.getElementById('restartButton');
const nextStageButton = document.getElementById('nextStageButton');

const keys = {};
const worldWidth = 5600;
let screenWidth = 0;
let screenHeight = 0;
let cameraX = 0;
let score = 0;
let lives = 3;
let gameFinished = false;
let lastTime = 0;
let currentStage = 1;
let restartFromStageOne = false;

const player = { x: 120, y: 350, width: 28, height: 40, speed: 5, velocityY: 0, onGround: false, platform: null, jumpsAvailable: 3, maxJumps: 3 };

const stageData = {
  1: {
    platforms: [
      { x: 0, y: 430, width: 850, height: 150 }, { x: 1000, y: 390, width: 550, height: 190 },
      { x: 1700, y: 430, width: 600, height: 150 }, { x: 2420, y: 350, width: 360, height: 230 },
      { x: 2900, y: 430, width: 680, height: 150 }, { x: 3800, y: 380, width: 420, height: 200 },
      { x: 4450, y: 430, width: 650, height: 150 }, { x: 5250, y: 350, width: 350, height: 230 },
      { x: 520, y: 315, width: 170, height: 20 }, { x: 1160, y: 275, width: 170, height: 20 },
      { x: 1900, y: 330, width: 160, height: 20 }, { x: 3050, y: 320, width: 180, height: 20 },
      { x: 3900, y: 250, width: 170, height: 20 }, { x: 4630, y: 330, width: 180, height: 20 }
    ],
    coins: [[350, 375], [570, 270], [1210, 230], [1950, 285], [3120, 275], [3980, 205], [4700, 285], [5380, 300], [5500, 300]],
    enemies: [[700, 400], [1300, 350], [2050, 400], [2700, 320], [3300, 400], [4050, 350], [4800, 400], [5400, 310]]
  },
  2: {
    platforms: [
      { x: 0, y: 430, width: 950, height: 150 }, { x: 1100, y: 350, width: 400, height: 230 },
      { x: 1650, y: 380, width: 550, height: 200 }, { x: 2350, y: 320, width: 280, height: 260 },
      { x: 2800, y: 380, width: 620, height: 200 }, { x: 3650, y: 430, width: 500, height: 150 },
      { x: 4300, y: 350, width: 380, height: 230 }, { x: 5050, y: 380, width: 550, height: 200 },
      { x: 480, y: 350, width: 150, height: 20 }, { x: 1280, y: 280, width: 160, height: 20 },
      { x: 1950, y: 310, width: 170, height: 20 }, { x: 2850, y: 270, width: 180, height: 20 },
      { x: 3800, y: 360, width: 150, height: 20 }, { x: 4680, y: 280, width: 170, height: 20 }
    ],
    coins: [[250, 375], [620, 300], [1350, 230], [1800, 265], [2600, 270], [3200, 360], [4050, 300], [4900, 330], [5400, 330]],
    enemies: [
      [350, 400, 50, 650], [1250, 320, 1150, 1500], [1850, 350, 1700, 2200], [2500, 290, 2400, 2630],
      [3100, 350, 2850, 3420], [3900, 400, 3670, 4150], [4450, 320, 4350, 4680], [5250, 350, 5150, 5600]
    ]
  },
  3: {
    platforms: [
      { x: 0, y: 430, width: 700, height: 150 }, { x: 850, y: 350, width: 400, height: 230 },
      { x: 1400, y: 430, width: 500, height: 150 }, { x: 2050, y: 300, width: 400, height: 280 },
      { x: 2600, y: 390, width: 550, height: 190 }, { x: 3300, y: 280, width: 400, height: 300 },
      { x: 3850, y: 420, width: 450, height: 160 }, { x: 4450, y: 330, width: 350, height: 250 },
      { x: 4950, y: 390, width: 650, height: 190 },
      { x: 380, y: 330, width: 150, height: 20 }, { x: 980, y: 265, width: 160, height: 20 },
      { x: 1550, y: 350, width: 170, height: 20 }, { x: 2180, y: 220, width: 170, height: 20 },
      { x: 2750, y: 315, width: 180, height: 20 }, { x: 3420, y: 200, width: 170, height: 20 },
      { x: 4570, y: 250, width: 170, height: 20 },
      { x: 690, y: 360, width: 120, height: 20, movement: 'horizontal', min: 690, max: 820, speed: 1.5 },
      { x: 1900, y: 350, width: 130, height: 20, movement: 'vertical', min: 240, max: 370, speed: 1.2 },
      { x: 3150, y: 330, width: 130, height: 20, movement: 'horizontal', min: 3130, max: 3280, speed: 1.4 },
      { x: 4300, y: 300, width: 130, height: 20, movement: 'vertical', min: 230, max: 390, speed: 1.1 }
    ],
    coins: [[260, 375], [440, 295], [760, 325], [1030, 210], [1580, 310], [2240, 165], [2800, 275], [3470, 145], [4050, 365], [4630, 215], [5250, 335], [5500, 335]],
    enemies: [
      [500, 400, 300, 650], [1030, 320, 880, 1220], [1600, 400, 1450, 1850], [2200, 260, 2070, 2420],
      [2800, 350, 2650, 3050], [3450, 240, 3320, 3680], [4050, 390, 3900, 4250], [4620, 300, 4500, 4750], [5250, 360, 5050, 5550]
    ]
  }
};

let platforms = [];
let coins = [];
let enemies = [];
const goal = { x: 5485, y: 270, width: 75, height: 160 };
const explosions = [];

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  canvas.width = screenWidth * pixelRatio;
  canvas.height = screenHeight * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function loadStage(stageNum) {
  const stage = stageData[stageNum];
  platforms = stage.platforms.map(platform => ({ ...platform }));
  coins = stage.coins.map(([x, y]) => ({ x, y, collected: false }));
  enemies = stage.enemies.map(data => {
    const [x, y, minX, maxX] = data;
    return { 
      x, y, width: 30, height: 30, startX: x, direction: 1, defeated: false,
      minX: minX !== undefined ? minX : x - 90,
      maxX: maxX !== undefined ? maxX : x + 90
    };
  });
  currentStage = stageNum;
}

function resetGame(stageNum = currentStage) {
  loadStage(stageNum);
  player.x = 120; player.y = 350; player.velocityY = 0; player.onGround = false; player.platform = null; player.jumpsAvailable = player.maxJumps; cameraX = 0;
  score = 0; lives = 3; gameFinished = false;
  restartFromStageOne = false;
  explosions.length = 0;
  resultElement.classList.remove('visible');
  nextStageButton.style.display = 'none';
  restartButton.style.display = 'block';
  updateScore();
}

function updateScore() { scoreElement.textContent = String(score).padStart(6, '0'); }
function overlaps(first, second) { return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y; }

function loseLife() {
  lives -= 1;
  if (lives <= 0) finishGame(false);
  else { player.x = Math.max(80, player.x - 220); player.y = 250; player.velocityY = 0; player.jumpsAvailable = player.maxJumps; }
}

function finishGame(won) {
  gameFinished = true;
  restartFromStageOne = false;
  resultTitle.textContent = won ? 'RUN COMPLETE' : 'GAME OVER';
  resultText.textContent = won ? '月明かりの向こうへ到達しました。' : '夜が明ける前に、もう一度走ろう。';
  nextStageButton.style.display = 'none';
  restartButton.style.display = 'block';
  resultElement.classList.add('visible');
}

function finishGameWithStageClear() {
  gameFinished = true;
  restartFromStageOne = currentStage === 3;
  resultTitle.textContent = 'STAGE CLEAR!';
  resultText.textContent = '月明かりの向こうへ到達しました。';
  resultElement.classList.add('visible');
  
  if (currentStage < 3) {
    nextStageButton.textContent = `STAGE${currentStage + 1}へ`;
    nextStageButton.style.display = 'block';
    restartButton.style.display = 'none';
  } else {
    nextStageButton.style.display = 'none';
    restartButton.style.display = 'block';
  }
}

function update(delta) {
  if (gameFinished) return;
  const movingLeft = keys.ArrowLeft;
  const movingRight = keys.ArrowRight;
  if (movingLeft) player.x -= player.speed;
  if (movingRight) player.x += player.speed;
  if (keys[' '] && player.jumpsAvailable > 0) { player.velocityY = -12; player.jumpsAvailable--; player.onGround = false; player.platform = null; keys[' '] = false; }

  const standingPlatform = player.onGround && player.platform && platforms.includes(player.platform) &&
    player.x + player.width > player.platform.x && player.x < player.platform.x + player.platform.width
    ? player.platform : null;
  let carriedByPlatform = false;
  const previousStandingPlatform = standingPlatform;
  platforms.forEach(platform => {
    platform.previousX = platform.x;
    platform.previousY = platform.y;
    if (!platform.movement) return;
    const direction = platform.direction || 1;
    if (platform.movement === 'horizontal') platform.x += direction * platform.speed;
    if (platform.movement === 'vertical') platform.y += direction * platform.speed;
    const position = platform.movement === 'horizontal' ? platform.x : platform.y;
    if (position < platform.min || position > platform.max) {
      platform.direction = -direction;
      if (platform.movement === 'horizontal') platform.x = Math.max(platform.min, Math.min(platform.max, platform.x));
      else platform.y = Math.max(platform.min, Math.min(platform.max, platform.y));
    }
  });

  if (previousStandingPlatform) {
    player.x += previousStandingPlatform.x - previousStandingPlatform.previousX;
    player.y = previousStandingPlatform.y - player.height;
    player.velocityY = 0;
    player.onGround = true;
    player.platform = previousStandingPlatform;
    carriedByPlatform = true;
  }

  player.velocityY += 0.55;
  player.y += player.velocityY;
  player.onGround = false;
  platforms.forEach(platform => {
    const landing = player.velocityY >= 0 && player.x + player.width > platform.x && player.x < platform.x + platform.width;
    const previousPlayerBottom = player.y + player.height - player.velocityY;
    const carried = carriedByPlatform && platform === previousStandingPlatform;
    if (carried || (landing && player.y + player.height >= platform.y && previousPlayerBottom <= platform.previousY)) {
      player.y = platform.y - player.height; player.velocityY = 0; player.onGround = true; player.platform = platform; player.jumpsAvailable = player.maxJumps;
    }
  });
  player.x = Math.max(0, Math.min(worldWidth - player.width, player.x));
  if (player.y > screenHeight + 80) loseLife();

  coins.forEach(coin => {
    if (!coin.collected && overlaps(player, { x: coin.x - 9, y: coin.y - 9, width: 18, height: 18 })) {
      coin.collected = true; score += 100; updateScore();
    }
  });
  enemies.forEach(enemy => {
    if (enemy.defeated) return;
    enemy.x += enemy.direction * 1.1;
    if (enemy.x < enemy.minX || enemy.x > enemy.maxX) enemy.direction *= -1;
    enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
    if (overlaps(player, enemy)) {
      const playerCenterY = player.y + player.height / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const playerBottomY = player.y + player.height;
      const enemyTopY = enemy.y;
      const isStompingFromAbove = player.velocityY > 2 && playerBottomY < enemyTopY + 18 && playerCenterY < enemyCenterY;
      if (isStompingFromAbove) {
        enemy.defeated = true;
        player.velocityY = -7;
        score += 250;
        updateScore();
        explosions.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, lifetime: 0.5, maxLifetime: 0.5 });
      }
      else if (Math.abs(playerCenterY - enemyCenterY) < 15 || player.velocityY <= 2) {
        loseLife();
      }
    }
  });
  
  if (overlaps(player, goal)) {
    finishGameWithStageClear();
  }
  
  explosions.forEach((explosion, index) => {
    explosion.lifetime -= delta;
    if (explosion.lifetime <= 0) explosions.splice(index, 1);
  });
  
  cameraX += (Math.max(0, player.x - screenWidth * 0.35) - cameraX) * 0.1;
  cameraX = Math.max(0, Math.min(worldWidth - screenWidth, cameraX));
}

function draw() {
  const sky = context.createLinearGradient(0, 0, 0, screenHeight);
  sky.addColorStop(0, '#111a40'); sky.addColorStop(1, '#273463');
  context.fillStyle = sky; context.fillRect(0, 0, screenWidth, screenHeight);
  context.save(); context.translate(-cameraX * 0.18, 0);
  context.fillStyle = '#1a2750';
  for (let x = -200; x < worldWidth; x += 180) { context.beginPath(); context.moveTo(x, screenHeight); context.lineTo(x + 90, 220 + (x % 70)); context.lineTo(x + 250, screenHeight); context.fill(); }
  context.restore();

  context.save(); context.translate(-cameraX, 0);
  context.fillStyle = '#f6df9b'; context.beginPath(); context.arc(780, 110, 44, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#c9b873'; context.beginPath(); context.arc(800, 95, 44, 0, Math.PI * 2); context.fill();
  platforms.forEach(platform => { context.fillStyle = '#121931'; context.fillRect(platform.x, platform.y, platform.width, platform.height); context.fillStyle = '#f2d36b'; context.fillRect(platform.x, platform.y, platform.width, 5); });
  coins.forEach(coin => { if (!coin.collected) { context.fillStyle = '#f2d36b'; context.beginPath(); context.arc(coin.x, coin.y + Math.sin(Date.now() / 250 + coin.x) * 3, 8, 0, Math.PI * 2); context.fill(); } });
  enemies.forEach(enemy => { if (!enemy.defeated) { context.fillStyle = '#e56078'; context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height); context.fillStyle = '#24243e'; context.fillRect(enemy.x + 6, enemy.y + 8, 5, 5); context.fillRect(enemy.x + 19, enemy.y + 8, 5, 5); } });
  explosions.forEach(explosion => {
    const progress = 1 - (explosion.lifetime / explosion.maxLifetime);
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = progress * 30;
      const px = explosion.x + Math.cos(angle) * distance;
      const py = explosion.y + Math.sin(angle) * distance;
      const size = (1 - progress) * 5;
      context.fillStyle = `rgba(255, 140, 0, ${1 - progress})`;
      context.beginPath();
      context.arc(px, py, size, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = `rgba(255, 100, 100, ${1 - progress})`;
    context.font = `bold ${20 + progress * 15}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('あべし！', explosion.x, explosion.y - 15);
  });
  context.fillStyle = '#f4f1e7'; context.fillRect(player.x, player.y, player.width, player.height); context.fillStyle = '#e56078'; context.fillRect(player.x + 4, player.y + 7, 20, 7); context.fillStyle = '#20223a'; context.fillRect(player.x + 5, player.y + 16, 6, 5); context.fillRect(player.x + 17, player.y + 16, 6, 5);
  context.fillStyle = '#f2d36b'; context.fillRect(5485, 270, 7, 160); context.fillStyle = '#fff1b0'; context.beginPath(); context.moveTo(5492, 270); context.lineTo(5560, 295); context.lineTo(5492, 320); context.fill();
  context.restore();
}

function gameLoop(time) { const delta = Math.min((time - lastTime) / 1000, 0.04); lastTime = time; update(delta); draw(); requestAnimationFrame(gameLoop); }

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', event => { keys[event.key] = true; if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault(); });
window.addEventListener('keyup', event => { keys[event.key] = false; });
restartButton.addEventListener('click', () => resetGame(restartFromStageOne ? 1 : currentStage));
nextStageButton.addEventListener('click', () => {
  loadStage(currentStage + 1);
  player.x = 120; player.y = 350; player.velocityY = 0; player.onGround = false; player.platform = null; player.jumpsAvailable = player.maxJumps; cameraX = 0;
  lives = 3; gameFinished = false;
  explosions.length = 0;
  resultElement.classList.remove('visible');
  nextStageButton.style.display = 'none';
});
resizeCanvas(); resetGame(); requestAnimationFrame(gameLoop);
