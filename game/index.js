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
          world.checkLines();
          player.getPiece();
          io.sockets.emit('grid-updated', { grid: world.grid.cells });
        }
        io.sockets.emit('player-moved', { player: player });
      }
    });
  }

  world.gameLoop = setInterval( movePieces, 300 / ( speed / 2 ) );


  world.checkLines = function(){
    var linesToClear = [];

    for (var y = world.grid.cells.length - 1; y >= 0; y--) {
      var complete = true;
      for (var x = 0; x < world.grid.cells[y].length; x++) {
        if (world.grid.cells[y][x].navigable) {
          complete = false;
        }
      }
      if (complete) {
        linesToClear.push(y);
      }
    }

    if (linesToClear.length > 0) {
      linesToClear.reverse().forEach(function(line){
        clearLine(line);
      });
      io.sockets.emit('grid-updated', { grid: world.grid.cells });
    }
  }

  function clearLine(line) {
    world.grid.cells.splice(line, 1);
    world.grid.cells.unshift(new Grid(11,1).cells[0]);
  }

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
