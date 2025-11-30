let nextLevelButton = null;

function startGame(level = 1) {
  if (nextLevelButton) {
    nextLevelButton.remove();
    nextLevelButton = null;
  }

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const houseSettings = {
    1: { bg: "#8B5E3C", floor: "#3E1E0E", decayRate: 0.05, layers: 5, timer: 17 },
    2: { bg: "#654321", floor: "#2B160C", decayRate: 0.12, layers: 5, timer: 15 }
  };

  const house = houseSettings[level] || houseSettings[1];
  const playerImage = new Image();

  playerImage.src = "./Images/HelperElf.png";
  let player = { x: W/2, y: H - 500, w: 500, h: 450, speed: 5 };
  const keys = {};

  window.onkeydown = e => keys[e.code] = true;
  window.onkeyup = e => keys[e.code] = false;

  const treeImage = new Image();
  treeImage.src = "./Images/Tree.png";

  const tree = { x: W/3, y: H-440, width: 300, height: 400, layers: [] };
  const primaryColors = ["#ff0000", "#0000ff", "#ffff00", "#00ff00"];

  function generateLights() {
    tree.layers = [];
    const usableLayers = house.layers - 1;
    for (let i = 0; i < usableLayers; i++) {
      const rowY = tree.y + 60 + i * (tree.height / house.layers);
      const widthRatio = (i+1)/house.layers;
      const rowWidth = (0.25 + widthRatio * 0.55) * tree.width;
      const startX = tree.x + (tree.width - rowWidth)/2;
      const numLights = Math.floor(rowWidth / 35);
      const row = [];

      for (let j = 0; j < numLights; j++) {
        row.push({
          x: startX + j*(rowWidth/(numLights-1)),
          y: rowY,
          color: primaryColors[Math.floor(Math.random()*primaryColors.length)],
          on: true,
          cooldown: 0
        });
      }
      tree.layers.push(row);
    }
  }
  generateLights();

  const presentImage = new Image();
  presentImage.src = "./Images/present.png";
  const present = { x: tree.x-120, y: H-150, w:150, h:110 };

  let timer = house.timer;
  let gameOver = false;
  let message = "";

  function update(dt) {
    if (gameOver) {
      return
    }
    if(keys["ArrowLeft"]) {
      player.x -= player.speed
    }
    if(keys["ArrowRight"]) {
      player.x += player.speed
    }
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    if(keys["Space"]) {
      tree.layers.forEach(row => {
        row.forEach(light => {
          if(Math.abs((player.x + player.w/2) - light.x) < 35){
            light.on = true;
            light.cooldown = 2;
          }
        });
      });
    }

    tree.layers.forEach(row => {
      row.forEach(light => {
        if(light.cooldown > 0){
          light.cooldown -= dt;
        } 
        else {
          if(Math.random() < house.decayRate*dt){
            light.on = false;
            light.cooldown = 1;
          }
        }
      });
    });

    timer -= dt;
    if(timer <= 0){
      gameOver = true;
      const allOn = tree.layers.every(row => row.every(l => l.on));

      if(allOn){
        if(level === 1){
          message = "Great job! Starting Level 2...";
          setTimeout(() => startGame(1), 3000);
        } 
        else {
          message = "YOU SAVED CHRISTMAS!!!";
        }
      } 
      else {
        if(level === 1){
          message = "Game Over — Some lights are off! Try again!!";
          setTimeout(() => startGame(1), 3000);
        } 
        else {
          message = "Game Over — Some lights are off! Try again!!";
          setTimeout(() => startGame(2), 3000);
        }
      }
    }
  }

  function drawBackground(){
    ctx.fillStyle = house.bg;
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = house.floor;
    ctx.fillRect(0,H-60,W,60);

    if(presentImage.complete) {
      ctx.drawImage(presentImage,present.x,present.y,present.w,present.h);
    }
  }

  function drawTree(){
    ctx.drawImage(treeImage,tree.x,tree.y,tree.width,tree.height);

    tree.layers.forEach(row => {
      row.forEach(light => {
        ctx.fillStyle = light.on ? light.color : "rgba(200,200,200,0.28)";
        ctx.beginPath();
        ctx.arc(light.x, light.y, 9,0,Math.PI*2);
        ctx.fill();
      });
    });
  }

  function drawPlayer(){
    ctx.drawImage(playerImage,player.x,player.y,player.w,player.h);
  }

  function drawTimer(){
    const pct = Math.max(0,timer/house.timer);
    ctx.fillStyle = "#222";
    ctx.fillRect(10,10,200,20);
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(10,10,200*pct,20);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(10,10,200,20);
  }

  function drawMessage(){
    if(!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(W/2-200,H/2-40,400,80);

    ctx.fillStyle = "#fff";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message,W/2,H/2 + 8);
  }

  let last = performance.now();
  function loop(now){
    const dt = (now-last)/1000;
    last = now;

    update(dt);

    ctx.clearRect(0,0,W,H);
    drawBackground();
    drawTree();
    drawPlayer();
    drawTimer();
    drawMessage();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}