  const speedFactor = 0.85;
  const lightDecayRate = 0.1;
  const baseLevelTime = 20;
  const basePlayerSpeed = 400;

function getLevelSettings(level) {
  const speedMultiplier = Math.pow(1 / speedFactor, level - 1);
  const decayRate = lightDecayRate * speedMultiplier;
  const timer = Math.max(10, baseLevelTime - (level - 1) * 1.5);
  const playerSpeed = basePlayerSpeed + (level - 1) * 50;

  return {
    bg: level % 2 === 1 ? "#8B5E3C" : "#654321",
    floor: level % 2 === 1 ? "#3E1E0E" : "#2B160C",
    decayRate: decayRate,
    timer: timer,
    playerSpeed: playerSpeed,
  };
}

function startGame(level = 1) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const house = getLevelSettings(level);
  document.getElementById("levelLabel").textContent = level;
  document.getElementById("gameMessage").textContent = " ";

  const playerImage = new Image();
  playerImage.src = "./Images/HelperElf.png";
  let player = { x: W/2, y: H-500, w: 500, h: 450, speed: house.playerSpeed };

  const keys = {};
  window.onkeydown = e => keys[e.code] = true;
  window.onkeyup = e => keys[e.code] = false;

  const treeImage = new Image();
  treeImage.src = "./Images/Tree.png";
  const rows = 7 + Math.floor(level / 3);
  const tree = { x: W/3, y: H-440, width: 300, height: 400, lights: [] };
  const colors = ["#ff0000", "#0000ff", "#ffff00", "#00ff00", "#ff32e4ff"];
  const rowSpacing = tree.height / rows;

  tree.lights = [];
  for(let i=1; i<rows-1; i++){
    const y = tree.y + 20 + i*rowSpacing;
    const numLights = i*2+1;
    const rowWidth = (i/rows)*tree.width*0.9 + tree.width*0.1;
    for(let j=0; j<numLights; j++){
      const x = tree.x + tree.width/2 - rowWidth/2 + j*(rowWidth/(numLights-1 || 1));
      tree.lights.push({ x:x, y:y, on: Math.random() > (0.1 + (level * 0.05)), color: colors[Math.floor(Math.random()*colors.length)] });
    }
  }

  const presentImage = new Image();
  presentImage.src = "./Images/present.png";
  const present = { x: tree.x-120, y:H-150, w:150, h:110 };

  let timer = house.timer;
  let gameOver = false;
  let message = "";

  function update(dt){
    if(gameOver){
      return;
    }
    if(keys["ArrowLeft"]){
      player.x -= player.speed * dt;
    }
    if(keys["ArrowRight"]){
      player.x += player.speed * dt;
    }
    player.x = Math.max(0, Math.min(W-player.w, player.x));

    if(keys["Space"]){
      tree.lights.forEach(light=>{
        if(Math.abs(player.x+player.w/2 - light.x)<50){
          light.on = true;
        }
      });
    }

    tree.lights.forEach(light=>{
      if(Math.random() < house.decayRate * dt){
        light.on = false;
      }
    });

    timer -= dt;
    if(timer <= 0) {
      gameOver = true;
      const allOn = tree.lights.every(l=>l.on);

      if(allOn){
          message = `Great job, you saved christmas! Starting Level ${level + 1}...`;
          setTimeout(()=>startGame(level + 1), 3000);
        } 
        else {
          message = "Game Over — Some lights are off! Restarting level 1...";
          setTimeout(()=>startGame(1), 3000);
        } 
        document.getElementById("gameMessage").textContent = message;
    }
  }

  function draw(){
    ctx.fillStyle = house.bg;
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = house.floor;
    ctx.fillRect(0,H-60,W,60);

    if(presentImage.complete){
      ctx.drawImage(presentImage,present.x,present.y,present.w,present.h);
    }

    if(treeImage.complete){
      ctx.drawImage(treeImage,tree.x,tree.y,tree.width,tree.height);
    }

    tree.lights.forEach(light=>{
      ctx.beginPath();
      ctx.arc(light.x, light.y, 9, 0, Math.PI * 2);
      if(light.on){
        ctx.fillStyle = light.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = light.color;
        ctx.fill();
        ctx.shadowBlur = 0
      } 
      else {
        ctx.fillStyle = "rgba(200,200,200,0.3)";
        ctx.fill();
      }
    });

    if(playerImage.complete){
      ctx.drawImage(playerImage,player.x,player.y,player.w,player.h);
    }

    const pct = Math.max(0,timer/house.timer);
    const timerX = 10;
    const timerY = 10;
    const timerW = 200;
    const timerH = 20;

    ctx.fillStyle="#222";
    ctx.fillRect(timerX, timerY, timerW, timerH);
    ctx.fillStyle="#f1c40f";
    ctx.fillRect(timerX, timerY, timerW * pct, timerH);
    ctx.strokeStyle="#fff";
    ctx.strokeRect(timerX, timerY, timerW, timerH);

    ctx.fillStyle ="#fff"
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx. fillText(`Time: ${timer.toFixed(1)}s`, timerX + timerW + 10, timerY + 15);

    if(gameOver){
      ctx.fillStyle="rgba(0,0,0,0.6)";
      ctx.fillRect(W/2-200,H/2-40,400,80);
      ctx.fillStyle="#fff";
      ctx.font="22px sans-serif";
      ctx.textAlign="center";
      ctx.fillText(message,W/2,H/2+10);
    }
  }

  let last = performance.now();
  function loop(now){
    const dt = (now-last)/1000;
    last = now;
    update(dt);
    draw();
    if (!gameOver) {
    requestAnimationFrame(loop);
    }
  } 
  requestAnimationFrame(loop);
}
window.onload = function() {
  const initialLevel = parseInt(document.getElementById("levelLabel").textContent, 10) || 1;
  startGame(initialLevel);
};
