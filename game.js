const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resultElement = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const restartButton = document.getElementById('restartButton');

const keys = {};
const worldWidth = 5600;
let screenWidth = 0;
let screenHeight = 0;
let cameraX = 0;
let score = 0;
let lives = 3;
let gameFinished = false;
let lastTime = 0;

const player = { x: 120, y: 350, width: 28, height: 40, speed: 5, velocityY: 0, onGround: false };
const platforms = [
  { x: 0, y: 430, width: 850, height: 150 }, { x: 1000, y: 390, width: 550, height: 190 },
  { x: 1700, y: 430, width: 600, height: 150 }, { x: 2420, y: 350, width: 360, height: 230 },
  { x: 2900, y: 430, width: 680, height: 150 }, { x: 3800, y: 380, width: 420, height: 200 },
  { x: 4450, y: 430, width: 650, height: 150 }, { x: 5250, y: 350, width: 350, height: 230 },
  { x: 520, y: 315, width: 170, height: 20 }, { x: 1160, y: 275, width: 170, height: 20 },
  { x: 1900, y: 330, width: 160, height: 20 }, { x: 3050, y: 320, width: 180, height: 20 },
  { x: 3900, y: 250, width: 170, height: 20 }, { x: 4630, y: 330, width: 180, height: 20 }
];
const coins = [[350, 375], [570, 270], [1210, 230], [1950, 285], [3120, 275], [3980, 205], [4700, 285], [5380, 300], [5500, 300]]
  .map(([x, y]) => ({ x, y, collected: false }));
const enemies = [[700, 400], [1300, 350], [2050, 400], [2700, 320], [3300, 400], [4050, 350], [4800, 400], [5400, 310]]
  .map(([x, y]) => ({ x, y, width: 30, height: 30, startX: x, direction: 1, defeated: false }));

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  canvas.width = screenWidth * pixelRatio;
  canvas.height = screenHeight * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function resetGame() {
  player.x = 120; player.y = 350; player.velocityY = 0; cameraX = 0;
  score = 0; lives = 3; gameFinished = false;
  coins.forEach(coin => coin.collected = false);
  enemies.forEach(enemy => { enemy.defeated = false; enemy.x = enemy.startX; });
  resultElement.classList.remove('visible');
  updateScore();
}

function updateScore() { scoreElement.textContent = String(score).padStart(6, '0'); }
function overlaps(first, second) { return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y; }

function loseLife() {
  lives -= 1;
  if (lives <= 0) finishGame(false);
  else { player.x = Math.max(80, player.x - 220); player.y = 250; player.velocityY = 0; }
}

function finishGame(won) {
  gameFinished = true;
  resultTitle.textContent = won ? 'RUN COMPLETE' : 'GAME OVER';
  resultText.textContent = won ? '月明かりの向こうへ到達しました。' : '夜が明ける前に、もう一度走ろう。';
  resultElement.classList.add('visible');
}

function update(delta) {
  if (gameFinished) return;
  const movingLeft = keys.ArrowLeft;
  const movingRight = keys.ArrowRight;
  if (movingLeft) player.x -= player.speed;
  if (movingRight) player.x += player.speed;
  if (keys[' '] && player.onGround) { player.velocityY = -12; player.onGround = false; keys[' '] = false; }

  player.velocityY += 0.55;
  player.y += player.velocityY;
  player.onGround = false;
  platforms.forEach(platform => {
    const landing = player.velocityY >= 0 && player.x + player.width > platform.x && player.x < platform.x + platform.width;
    if (landing && player.y + player.height >= platform.y && player.y + player.height - player.velocityY <= platform.y) {
      player.y = platform.y - player.height; player.velocityY = 0; player.onGround = true;
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
    if (Math.abs(enemy.x - enemy.startX) > 90) enemy.direction *= -1;
    if (overlaps(player, enemy)) {
      if (player.velocityY > 2 && player.y + player.height < enemy.y + 16) { enemy.defeated = true; player.velocityY = -7; score += 250; updateScore(); }
      else loseLife();
    }
  });
  if (player.x > 5480) finishGame(true);
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
  context.fillStyle = '#f4f1e7'; context.fillRect(player.x, player.y, player.width, player.height); context.fillStyle = '#e56078'; context.fillRect(player.x + 4, player.y + 7, 20, 7); context.fillStyle = '#20223a'; context.fillRect(player.x + 5, player.y + 16, 6, 5); context.fillRect(player.x + 17, player.y + 16, 6, 5);
  context.fillStyle = '#f2d36b'; context.fillRect(5485, 270, 7, 160); context.fillStyle = '#fff1b0'; context.beginPath(); context.moveTo(5492, 270); context.lineTo(5560, 295); context.lineTo(5492, 320); context.fill();
  context.restore();
}

function gameLoop(time) { const delta = Math.min((time - lastTime) / 1000, 0.04); lastTime = time; update(delta); draw(); requestAnimationFrame(gameLoop); }

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', event => { keys[event.key] = true; if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault(); });
window.addEventListener('keyup', event => { keys[event.key] = false; });
restartButton.addEventListener('click', resetGame);
resizeCanvas(); resetGame(); requestAnimationFrame(gameLoop);
