var Piece  = require('./piece')
  , autoId = 1;

module.exports = Player = function(io, socket, world, user) {
  var self = this;

  this.id       = 'player' + autoId++;
  this.score    = 0;
  this.piece    = null;
  this.username = user ? user.name : self.id;

  socket.playerId = this.id;

  this.getPiece = function(start) {
    self.piece = new Piece(start);
    return self.piece;
  };

  this.destroy = function() {
    io.sockets.emit('player-quit', { player: self });
  };

  this.die = function(killer) {
    // write later
    // destroy player because game is over, not because they quit
  }

  this.getPiece(parseInt(world.width / 2));

  socket.on('username', function(data){

    for (var i = 0; i < world.players.length; i++) {
      if (data == world.players[i].username) {
        self.destroy();
        world.players.splice(i, 1);
        socket.emit('nope');
        socket.disconnect();
        console.log(data, ' denied access');
        return;
      }
    }

    self.username = data;
    console.log(self.username, 'joining game');

    socket.emit('game-enter', {
      grid: world.grid.cells,
      player: self,
      others: world.players,
      level: world.level
    });
  })

  io.sockets.emit('player-joined', { player: self });

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
          world.gameOver();
          return;
        }
        self.piece.eachSlot(function(x,y){
          world.grid.cells[y][x].navigable = false;
          world.grid.cells[y][x].color = self.piece.color || '#FFCD34';
        });
        world.checkLines();
        self.getPiece(parseInt(world.width / 2));
      }
      io.sockets.emit('player-moved', { player: self });
    }
  });

  socket.on('increment-score', function(){
    self.score++;
    io.sockets.emit('player-score-updated', self);
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
