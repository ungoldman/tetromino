var socket    = io.connect(window.location.hostname)
  , canvas    = $('#canvas')
  , context   = canvas.get(0).getContext('2d')
  , blockSize = 30
  , world;

socket.emit('username', $('.username').text());

socket.on('nope', function(){
  $('#access-denied').modal();
});

socket.on('game-enter', function(data){
  world = data;
  $('#world-level').text(world.level);
  $('.' + world.player.username + ' .score').text('0');
  $('#player-lines').text(0);

  addPlayerToBoard(world.player);

  for (var i = 0; i < world.others.length; i++) {
    addPlayerToBoard(world.others[i])
  }

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

  // not yet implemented
  key('space', function(e){
    e.preventDefault();
    socket.emit('player-drop');
  })

  gameOn();
  render();
});

function gameOn() {
  socket.on('player-joined', function(data) {
    world.others.push(data.player);
    addPlayerToBoard(data.player);
  });

  socket.on('player-moved', function(data) {
    var you = false;
    if(data.player.id === world.player.id) {
      world.player.piece = data.player.piece;
      you = true;
    } else {
      for (var i = 0; i < world.others.length; i++) {
        if (data.player.id == world.others[i].id) {
          world.others[i].piece = data.player.piece;
        }
      }
    }
    render();
  });

  socket.on('grid-updated', function(data) {
    world.grid = data.grid;
    render();
  });

  socket.on('line-cleared', function() {
    // world.level = data.level;
    // $('#world-level').text(data.level);
    var playerLines = parseInt($('#player-lines').text());
    playerLines++;
    $('#player-lines').text(playerLines);
    socket.emit('increment-score');
  });

  socket.on('player-score-updated', function(player){
    $('.' + player.username + ' .score').text(player.score);
    console.log('score updated');
  })

  socket.on('player-quit', function(data){
    removePlayer(data.player);
    render();
  });

  socket.on('level-up', function(data){
    world.level = data.level;
    $('#world-level').text(world.level);
  });

  socket.on('game-over', function(){
    socket.disconnect();
    var lines = $('#player-lines').text();
    $.post('/score', { score: lines }, function(data){
      console.log(data);
    });
    $('#game-over').find('.score').text(lines).end().modal();
    key('enter', function(e){
      e.preventDefault();
      window.top.location = '/scores';
    });
  });

  socket.on('world-reset', function(data){
    world.grid = data.grid;
    world.level = data.level;
    $('#world-level').text(world.level);
    $('.' + world.player.username + ' .score').text('0');
    $('#player-lines').text('0');
  });
}

function render(){
  drawGrid();
  drawPieces();
  drawLines();
}

function drawGrid(){
  var distance = blockSize;
  var width    = parseInt(world.grid[0].length);
  var height   = parseInt(world.grid.length);

  canvas.attr({
    width  : width  * distance + 1,
    height : height * distance + 1
  });

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      context.fillStyle = world.grid[y][x].color;
      context.fillRect(x * distance, y * distance, blockSize, blockSize);
    }
  }
}

function drawPieces(){
  var others = world.others;
  if (others.length == 0) return;
  for (var i = 0; i < others.length; i++) {
    if (others[i].id == world.player.id) continue;
    drawPiece(others[i].piece);
  }
  drawPiece(world.player.piece, true);
}

function drawLines(){
  var distance = blockSize;
  var width    = parseInt(world.grid[0].length) * distance;
  var height   = parseInt(world.grid.length) * distance;

  context.strokeStyle = "#1b2841";

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

function drawPiece(piece, you) {
  eachSlot(piece, function(x, y){
    if (you) context.fillStyle = piece.color;
    else context.fillStyle = 'rgba(255,205,52,.3)';
    context.fillRect(x * 30, y * 30, 30, 30);
  });
}

function removePlayer(player) {
  $('.' + player.username).remove();
  for (var i = 0; i < world.others.length; i++) {
    if (player.id == world.others[i].id) {
      world.others.splice(i, 1);
    }
  }
}

function addPlayerToBoard(player) {
  var $el  = $('.leaderboard.stats')
    , html = player.username + ': <span class="score">' + player.score + '</span>';

  if ($('.' + player.username).length > 0) return;

  $('<p class="' + player.username + '"/>').append(html).appendTo($el);
}
