var socket  = io.connect(window.location.hostname);
var canvas  = $('#canvas').get(0);
var context = canvas.getContext("2d");
var world;

socket.on('game-enter', function(data){
  world = data;

  var directions = ['left','right'];

  $.map(directions, function(direction, index){
    key(direction, function(e) {
      e.preventDefault();
      socket.emit('player-move', { direction: directions[index] });
    });
  });

  key('down', function(e){
    e.preventDefault();
    socket.emit('player-fall');
  });

  key('q', function(e){
    e.preventDefault();
    socket.emit('player-rotate', { direction: 'left' });
  });

  key('e', function(e){
    e.preventDefault();
    socket.emit('player-rotate', { direction: 'right' });
  });

  render();
});

socket.on('player-moved', function(data) {
  world.player.piece = data.player.piece;
  // var you = false;
  // if(data.player.id === world.player.id) {
  //   world.player.location = data.player.location;
  //   world.player.dir = data.player.dir;
  //   you = true;
  // }
  // renderPlayer(data.player, you);
  render();
});

socket.on('player-quit', function(data){
  //removePlayer(data.player);
  console.log('player quit', data);
  render();
});

function render(){
  drawGrid();
  drawPieces();
}

function drawGrid(){
  var dist   = 20;
  var w      = parseInt(world.grid[0].length) * dist;
  var h      = parseInt(world.grid.length) * dist;
  $('#canvas').attr({ width: w, height: h });


  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#fafafa";
  context.fillRect(0, 0, w, h);

  for (var x = 0; x <= w; x += dist) {
    context.moveTo(0.5 + x, 0);
    context.lineTo(0.5 + x, h);
  }

  for (var x = 0; x <= h; x += dist) {
    context.moveTo(0, 0.5 + x);
    context.lineTo(w, 0.5 + x);
  }

  context.strokeStyle = "#cde";
  context.stroke();
}

function drawPieces(){
  drawPiece(world.player.piece);
  // var others = world.others;
  // if (others.length == 0) return;
  // for (var i = 0; i < others.length; i++) {
  //   drawPiece(others[i].piece);
  // }
}

function eachSlot(piece, callback) {
  for (x = 0 ; x < piece.positions[piece.rotation].length; x++) {
    for (y = 0; y < piece.positions[piece.rotation][x].length; y++) {
      if (piece.positions[piece.rotation][x][y] == 1) {
        callback(piece.x + x, piece.y + y);
      }
    }
  }
}

function drawPiece(piece){
  eachSlot(piece, function(x, y){
    context.fillStyle = piece.color;
    context.fillRect(x * 20, y * 20, 20, 20);
  });
}
