const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const players = []
class Connection {
  #enemy
  constructor() {
    this.webSocket = new WebSocket('ws://localhost:1337/search');
    this.isFirst = false;
    this.webSocket.onmessage = (data) => {
      const event = JSON.parse(data.data);
      switch(event.type) {
        case 'init':
          this.isFirst = event.value === 'First'
          initPlayers(this.isFirst);
        break;
        case 'up':
          this.onUp(event);
        break;
        case 'down':
          this.onDown(event)
        break;
      }
    };
    this.webSocket.onclose = () => {};
    this.webSocket.onerror = () => {};
    this.webSocket.onopen = () => {};
  }
  onUp(event) {
    if(this.isFirst !== event.isFirst) {
      this.#enemy.onUp(event.value);
    }
  }
  onDown(event) {
    if(this.isFirst !== event.isFirst) {
      this.#enemy.onDown(event.value);
    }
  }
  setEnemy(player) {
    this.#enemy = player
  }

}
class Player {
  webSocket
  constructor({color, position, vilosity, gravity, keys}) {
    this.position = position;
    this.vilosity = vilosity;
    this.gravity = gravity;
    this.height = 100,
    this.width = 30;
    this.color = color;
    this.keys = keys;
  }
  draw() {
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    if (this.position.y + this.height <= canvas.height) {
      this.position.y += 10 * this.gravity;
    }
    const newXPosition = this.position.x + this.vilosity.x;
    if(newXPosition + this.width < canvas.width && newXPosition >= 0) {
      this.position.x = newXPosition;
    }
    this.draw();
  }

  onDown(key) {
    switch(key) {
      case this.keys.jump.char: if(this.position.y - 200 > 0) {this.position.y -= 200;} break;
      case this.keys.left.char: this.vilosity.x = -3; break;
      case this.keys.right.char: this.vilosity.x = 3; break;
    }
  }
  onUp(key) {
    switch(key) {
      case this.keys.left.char:
      case this.keys.right.char:
        this.vilosity.x = 0;
      break;
    }
  }
}
initCanvas();
const connection = new Connection();





function initCanvas () {
  canvas.height = 768;
  canvas.width = 1024;
  drawBackground();
}
function drawBackground() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, 1024, 768);
}
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}
function animate () {
  window.requestAnimationFrame(animate);
  clearCanvas();
  drawBackground();
  players.forEach(p => p.update());
}
function initPlayers(isFirst) {
  const player1 = new Player({color: 'red', position: {x: 0, y: 0}, vilosity: {x: 0, y: 5}, gravity: 0.7, keys: {jump: {char: 'w', pressed: false}, right: {char: 'd', pressed: false}, left: {char: 'a', pressed: false}}});
  const player2 = new Player({color: 'blue', position: {x: 100, y: 0}, vilosity: {x: 0, y: 5}, gravity: 0.7, keys: {jump: {char: 'w', pressed: false}, right: {char: 'd', pressed: false}, left: {char: 'a', pressed: false}}});
  const enemy = isFirst? player2 : player1;
  const player = isFirst ? player1 : player2;
  window.addEventListener('keydown', (event) => {
    console.log('KeyDown');
    connection.webSocket.send(JSON.stringify({type: 'down', value: event.key, isFirst}));
    player.onDown(event.key);
  });
  window.addEventListener('keyup', (event) => {
    connection.webSocket.send(JSON.stringify({type: 'up', value: event.key, isFirst}));
    player.onUp(event.key)
  });
  connection.setEnemy(enemy);
  players.push(player1);
  players.push(player2);
}

animate();


