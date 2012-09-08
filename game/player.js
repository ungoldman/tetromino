var autoId = 0;

module.exports = Player = function(io, socket, world, cb) {
  var self = this;

  var player = {
    id: 'p'+autoId++,
    score: 0,
    piece: null
  };

  socket.playerId = player.id;

  player.getPiece();

  socket.emit('game-enter', {
    grid: world.grid.cells,
    player: player,
    others: world.players
  });

  // io.sockets.emit('player-joined', { player: player });
  // io.sockets.emit('player-moved',  { player: player });

  socket.on('move-left', function(){
    var piece = self.piece;
    if (piece) {
      if (piece.isCool()) {
        piece.update('left');
        world.grid.update(piece);
      }
    }
  });

  socket.on('player-move', function(data) {
    var loc;
  
    if(!player.alive) return;
    if((new Date() - player.lastMoved) < 500 / player.speed) return;

    switch(data.dir) {
      case "left":
        if(world.grid.isNavigable(player.location.x-1, player.location.y))
          loc = world.grid.cells[player.location.y][player.location.x-1]
        break;
      case "right":
        if(world.grid.isNavigable(player.location.x+1, player.location.y))
          loc = world.grid.cells[player.location.y][player.location.x+1]
        break;
      case "up":
        if(world.grid.isNavigable(player.location.x, player.location.y-1))
          loc = world.grid.cells[player.location.y-1][player.location.x]
        break;
      case "down":
        if(world.grid.isNavigable(player.location.x, player.location.y+1))
          loc = world.grid.cells[player.location.y+1][player.location.x]
        break;
    }
    if(loc) {
      player.lastMoved = new Date();
      player.dir = data.dir;
      player.location = loc;
      io.sockets.emit('player-moved', {player: player});
    }
  });

  socket.on('player-turn', function(data) {
    if(!player.alive) return;

    var dir = data.dir;
    if(dir === "left" || dir === "right" || dir === "up" || dir === "down") {
      player.dir = dir;
      io.sockets.emit('player-moved', {player: player});
    }
  });

  socket.on('player-shoot', function(data) {
    if(!player.alive) return;
    if((new Date() - player.lastShot) < 500) return;
    player.lastShot = new Date();
    world.bullets.push(new Bullet(player, world.grid));
  });

  player.getPiece = function() {
    player.piece = new Piece();
  };

  player.destroy = function() {
    io.sockets.emit('player-quit', {player: player});
  };

  player.die = function(killer) {
    player.alive = false;
    io.sockets.emit('player-killed', {player:player, killer: killer});
    setTimeout(player.spawn, RESPAWN_TIME);
  }

  return player;
};
