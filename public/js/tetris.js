var loop = null;
var loopMilliseconds = 1000;

var count = 0;
var level = 1;
var score = 0;
var grid = null;
var piece = null;

$(document).ready(function() {

  key('left, a', function(e){
    e.preventDefault();
    piece.move(-1);
    //socket.emit('move-left');
  });

  key('right, d', function(e){
    e.preventDefault();
    piece.move(+1);
  });

  key('down, s', function(e){
    e.preventDefault();
    piece.fall();
  });

  key('q', function(e){
    piece.rotate();
  });

  key('e', function(e){
    piece.rotate();
  });

  initialize();
  render();
  loop = setInterval(gameLoop, loopMilliseconds);
});

function gameLoop() {
  update();
  render();
}

function initialize() {
  grid = new Grid(11, 18);
  piece = new Piece(4, 0, randomType());
}

function update() {
  if (piece) piece.fall();
}

function render() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var context = canvas.getContext("2d");
    context.fillStyle = "#fff";  
    context.fillRect (0, 0, 11 * 20, 18 * 20);  
  }
  if (piece) piece.render(context);
  if (grid) grid.render(context);
}

function incrementLevel() {
  level++;
  clearInterval(loop);
  loopMilliseconds /= 1.15;
  setInterval(gameLoop, loopMilliseconds);
  $('#level').html('Level: ' + level);
}

function incrementScore(lines) {
  count++;
  if (count == 5) {
    count = 0;
    incrementLevel();
  }
  score += level * (lines * lines);
  $('#score').html('Score: ' + score);
}

function gameOver() {
  clearInterval(loop);
  $('#gameOver').html('GAME OVER!');
}
