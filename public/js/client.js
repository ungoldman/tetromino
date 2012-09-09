var socket  = io.connect(window.location.hostname)
  , canvas  = $('#canvas').get(0)
  , context = canvas.getContext('2d')
  , world;

socket.on('game-enter', function(data){
  world = data;

  socket.on('world-reset', function(data){
    world = data;
  });

  var directions = ['left','right']
    , controls   = ['left, a','right, d'];

  $.map(controls, function(control, index){
    key(control, function(e) {
      e.preventDefault();
      socket.emit('player-move', { direction: directions[index] });
    });
  });

  key('down, s', function(e){
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

  key('space', function(e){
    e.preventDefault();
    socket.emit('player-drop');
  })

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

socket.on('grid-updated', function(data) {
  world.grid = data.grid;
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
  drawLines();
}

function drawGrid(){
  var distance = 20;
  var width    = parseInt(world.grid[0].length);
  var height   = parseInt(world.grid.length);

  $('#canvas').attr({ width: width * distance + 1, height: height * distance + 1 });

  // context.globalCompositeOperation = "source-over";
  // context.fillStyle = "#fafafa";
  // context.fillRect(0, 0, width * distance, height * distance);

  // draw cells
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      context.fillStyle = world.grid[y][x].color;
      context.fillRect(x * distance, y * distance, 20, 20);
    }
  }
}

function drawPieces(){
  drawPiece(world.player.piece);
  // var others = world.others;
  // if (others.length == 0) return;
  // for (var i = 0; i < others.length; i++) {
  //   drawPiece(others[i].piece);
  // }
}

function drawLines(){
  var distance = 20;
  var width    = parseInt(world.grid[0].length) * distance;
  var height   = parseInt(world.grid.length) * distance;

  context.strokeStyle = "#cde";

  // draw lines
  for (var x = 0; x <= width + 1; x += distance) {
    context.moveTo(0.5 + x, 0);
    context.lineTo(0.5 + x, height);
  }

  for (var x = 0; x <= height + 1; x += distance) {
    context.moveTo(0, 0.5 + x);
    context.lineTo(width, 0.5 + x);
  }

  context.stroke();
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
