var Piece  = require('./piece')
  , autoId = 0;

module.exports = Player = function(io, socket, world, user, cb) {
  var self = this;

  this.id       = 'player' + autoId++;
  this.score    = 0;
  this.piece    = null;
  this.username = user.name;

  socket.playerId = this.id;

  this.getPiece = function() {
    self.piece = new Piece();
    return self.piece;
  };

  this.destroy = function() {
    io.sockets.emit('player-quit', { player: self });
  };

  this.die = function(killer) {
    // write later
    // destroy player because game is over, not because they quit
  }

  this.getPiece();

  socket.emit('game-enter', {
    grid: world.grid.cells,
    player: self,
    others: world.players
  });

  // io.sockets.emit('player-joined', { player: player });
  // io.sockets.emit('player-moved',  { player: player });

  socket.on('player-move', function(data){
    if (self.piece) {
      self.piece.move(data.direction, world.grid);
      io.sockets.emit('player-moved', { player: self });
    }
  });

  socket.on('player-fall', function(){
    if (self.piece) {
      var oldId = self.piece.id;
      var piece = self.piece.fall(world.grid);
      if (!piece) {
        if (self.piece.checkCollision(world.grid) && self.piece.y == 0) {
          world.reset();
          io.sockets.emit('world-reset', {
            grid: world.grid.cells,
            player: self,
            others: world.players
          });
          return;
        }
        self.piece.eachSlot(function(x,y){
          console.log(x,y);
          world.grid.cells[y][x].navigable = false;
          world.grid.cells[y][x].color = '#777' || self.piece.color;
          console.log(world.grid.cells[y][x]);
        });
        piece = self.getPiece();
        if (!piece) world.reset();
        io.sockets.emit('grid-updated', { grid: world.grid.cells });
      }
      io.sockets.emit('player-moved', { player: self });
    }
  });

  socket.on('player-rotate', function(data){
    if (self.piece) {
      self.piece.rotate(data.direction, world.grid);
      // world.pieces.forEach(function(){
      //   if (this.id === self.piece.id) {
      //     this = self.piece;
      //   }
      // });
      io.sockets.emit('player-moved', { player: self });
    }
  });

  return this;
};
