var socketio = require('socket.io')
  , Grid     = require('./grid')
  , Player   = require('./player')
  , Piece    = require('./piece');

var game = function(io, user) {

  var speed = 1;

  var world = {};
  world.grid = new Grid(11, 18);
  world.players = [];

  var addPlayer = function(io, socket) {
    world.players.push(new Player(io, socket, world, user));
  };

  var removePlayer = function(socket) {
    for(var i = 0; i < world.players.length; i++) {
      if(world.players[i].id === socket.playerId) {
        world.players[i].destroy();
        world.players.splice(i, 1);
      }
    }
  };

  io.on('connection', function(socket) {
    addPlayer(io, socket);
    socket.on('disconnect', function() {
      removePlayer(socket);
    });
  });

  var movePieces = function() {
    world.players.forEach(function(player){
      if (player.piece) {
        var oldId = player.piece.id;
        var piece = player.piece.fall(world.grid);
        if (!piece) {
          if (player.piece.checkCollision(world.grid) && player.piece.y == 0) {
            world.reset();
            io.sockets.emit('world-reset', {
              grid: world.grid.cells,
              player: player,
              others: world.players
            });
            return;
          }
          player.piece.eachSlot(function(x,y){
            world.grid.cells[y][x].navigable = false;
            world.grid.cells[y][x].color = player.piece.color || '#777';
          });
          player.getPiece();
          io.sockets.emit('grid-updated', { grid: world.grid.cells });
        }
        io.sockets.emit('player-moved', { player: player });
      }
    });
  }

  var gameLoop = setInterval( movePieces, 300 / ( speed / 2 ) );

  world.reset = function(){
    world.grid = new Grid(11, 18);
    world.players.forEach(function(player){
      player.getPiece();
    });
  }

};

module.exports = {
  listen: function(server, user) {
    var io = socketio.listen(server, { "log level": 1 });
    return game(io, user);
  }
};
