var Piece = require('./piece');
var autoId = 0;

module.exports = Player = function(io, socket, world, user, cb) {
  var self = this;

  this.id = 'player'+autoId++;
  this.score = 0;
  this.piece = null;
  this.username = user.name;

  socket.playerId = this.id;

  this.getPiece = function() {
    self.piece = new Piece();
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
    if (player.piece) {
      self.piece.move(data.direction);
      world.grid.update(self.piece);
      socket.emit('player-moved', { player: self });
    }
  });

  socket.on('player-fall', function(){
    if (self.piece) {
      self.piece.fall();
      world.grid.update(self.piece);
      socket.emit('player-moved', { player: self });
    }
  });

  socket.on('player-rotate', function(data){
    if (self.piece) {
      self.piece.rotate(data.direction);
      world.grid.update(self.piece);
      socket.emit('player-moved', { player: self });
    }
  });

  return this;
};
