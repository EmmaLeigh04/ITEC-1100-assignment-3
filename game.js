// game.js - Elf Fixer Game: Cozy houses, horizontal primary lights, star on top
// Call startGame(level) to begin

function startGame(level = 1) {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
  
    // Player
    let player = { x: W/2, y: H - 80, w: 40, h: 60, speed: 5, img: new Image() };
    player.img.src = "./Images/HelperElf.png";
    let keys = {};
    let gameOver = false;
    let message = "";
  
    // Houses configuration
    const houses = {
      1: { bg: "#8B5E3C", floor: "#3E1E0E", lightDecayRate: 0.05, numLayers: 5 },
      2: { bg: "#654321", floor: "#2B160C", lightDecayRate: 0.08, numLayers: 6 }
    };
  
    const house = houses[level] || houses[1];
  
    // Tree
    const tree = {
      x: W/2,
      y: H - 400,
      width: 200,
      height: 350,
      layers: []
    };
  
    // Primary colors for lights
    const primaryColors = ["#ff0000", "#0000ff", "#ffff00", "#00ff00"]; // red, blue, yellow, green
  
    // Create horizontal light rows (skip bottom row to avoid touching floor)
    for (let i = 0; i < house.numLayers - 1; i++) {
      const rowY = tree.y + i * (tree.height / (house.numLayers - 1));
      const rowWidth = (i + 1) / house.numLayers * tree.width;
      const numLightsInRow = Math.max(3, Math.floor(rowWidth / 30));
      const rowLights = [];
      for (let j = 0; j < numLightsInRow; j++) {
        const x = tree.x - rowWidth / 2 + j * (rowWidth / (numLightsInRow - 1));
        const color = primaryColors[Math.floor(Math.random() * primaryColors.length)];
        rowLights.push({ x, y: rowY, color, on: true, decay: 0 });
      }
      tree.layers.push(rowLights);
    }
  
    // Timer
    const timerSeconds = level === 1 ? 25 : 30;
    let timer = timerSeconds;
  
    // Keyboard input
    window.addEventListener("keydown", e => { keys[e.code] = true; if(e.code=="Space") e.preventDefault(); });
    window.addEventListener("keyup", e => { keys[e.code] = false; });
  
    // Repair lights
    function repairLights() {
      tree.layers.forEach(layer => {
        layer.forEach(light => {
          const near = Math.abs(player.x + player.w / 2 - light.x) < 30;
          if (near && keys["Space"]) {
            light.on = true;
            light.decay = 2.5;
          }
        });
      });
    }
  
    // Randomly turn lights off over time
    function randomizeLights(dt) {
      tree.layers.forEach(layer => {
        layer.forEach(light => {
          if (light.decay > 0) {
            light.decay -= dt / 1000;
          } else {
            if (Math.random() < dt / 1000 * house.lightDecayRate) {
              light.on = false;
              light.decay = 2.0;
            }
          }
        });
      });
    }
  
    function update(dt) {
      if (gameOver) return;
      if(keys["ArrowLeft"]) player.x -= player.speed;
      if(keys["ArrowRight"]) player.x += player.speed;
      player.x = Math.max(0, Math.min(W - player.w, player.x));
  
      repairLights();
      randomizeLights(dt);
  
      timer -= dt / 1000;
      if(timer <= 0) {
        gameOver = true;
        const allOn = tree.layers.every(layer => layer.every(light => light.on));
        message = allOn ? "You kept the tree lit! Merry Christmas!" : "Game Over — Some lights are off!";
      }
    }
  
    // Draw house decorations
    function drawHouseDecor(level) {
      if(level === 1){
        // Rug
        ctx.fillStyle = "#D2691E";
        ctx.fillRect(150, H - 40, 500, 20);
        // Fireplace
        ctx.fillStyle = "#FF8C00";
        ctx.fillRect(50, H - 100, 80, 60);
      } else if(level === 2){
        // Darker rug
        ctx.fillStyle = "#4B2E1E";
        ctx.fillRect(100, H - 40, 600, 20);
        // Small table
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(600, H - 90, 50, 50);
      }
    }
  
    function drawBackground() {
      ctx.fillStyle = house.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = house.floor;
      ctx.fillRect(0, H-60, W, 60);
      drawHouseDecor(level);
    }
  
    function drawTree() {
      // Trunk
      ctx.fillStyle="#5b3a21";
      ctx.fillRect(tree.x-25, tree.y+tree.height-50, 50, 50);
  
      // Triangle foliage
      ctx.fillStyle="#0b6a2c";
      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y); // top
      ctx.lineTo(tree.x-tree.width/2, tree.y+tree.height-50);
      ctx.lineTo(tree.x+tree.width/2, tree.y+tree.height-50);
      ctx.closePath();
      ctx.fill();
  
      // Star on top
      drawStar(tree.x, tree.y-15, 5, 12, 6, "#ffdf00");
  
      // Draw lights
      tree.layers.forEach(layer => {
        layer.forEach(light => {
          ctx.fillStyle = light.on ? light.color : "rgba(180,180,180,0.25)";
          ctx.beginPath();
          ctx.arc(light.x, light.y, 10, 0, Math.PI*2);
          ctx.fill();
        });
      });
    }
  
    function drawStar(cx, cy, spikes, outerRadius, innerRadius, color){
      let rot=Math.PI/2*3;
      let x=cx;
      let y=cy;
      let step=Math.PI/spikes;
      ctx.beginPath();
      ctx.moveTo(cx,cy-outerRadius);
      for(let i=0;i<spikes;i++){
        x=cx+Math.cos(rot)*outerRadius;
        y=cy+Math.sin(rot)*outerRadius;
        ctx.lineTo(x,y);
        rot+=step;
  
        x=cx+Math.cos(rot)*innerRadius;
        y=cy+Math.sin(rot)*innerRadius;
        ctx.lineTo(x,y);
        rot+=step;
      }
      ctx.closePath();
      ctx.fillStyle=color;
      ctx.fill();
    }
  
    function drawPlayer(){
      ctx.fillStyle="#c0392b";
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillStyle="#e74c3c";
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x+player.w/2, player.y-15);
      ctx.lineTo(player.x+player.w, player.y);
      ctx.closePath();
      ctx.fill();
    }
  
    function drawTimer(){
      const pct=Math.max(0, timer/timerSeconds);
      ctx.fillStyle="#222";
      ctx.fillRect(10,10,200,20);
      ctx.fillStyle="#f1c40f";
      ctx.fillRect(10,10,200*pct,20);
      ctx.strokeStyle="#fff";
      ctx.strokeRect(10,10,200,20);
    }
  
    function drawUI(){
      drawTimer();
      if(gameOver){
        ctx.fillStyle="rgba(0,0,0,0.6)";
        ctx.fillRect(W/2-200,H/2-30,400,60);
        ctx.fillStyle="#fff";
        ctx.font="22px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(message,W/2,H/2+10);
      }
    }
  
    let lastTime=performance.now();
    function render(now){
      const dt=now-lastTime;
      lastTime=now;
  
      update(dt);
      ctx.clearRect(0,0,W,H);
      drawBackground();
      drawTree();
      drawPlayer();
      drawUI();
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
  }
  