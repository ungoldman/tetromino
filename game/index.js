var socketio = require('socket.io')
  , Grid     = require('./grid')
  , Player   = require('./player')
  , Piece    = require('./piece');

var game = function(io, user) {

  var speed = 1;

  var world = {};
  world.height = 18;
  world.width = 18;
  world.grid = new Grid(world.width, world.height);
  world.players = [];
  world.lines = 0;

  var addPlayer = function(io, socket) {
    world.players.push(new Player(io, socket, world, user));
  }

  var removePlayer = function(socket) {
    for(var i = 0; i < world.players.length; i++) {
      if(world.players[i].id === socket.playerId) {
        console.log(world.players[i].username, 'quitting game');
        world.players[i].destroy();
        world.players.splice(i, 1);
      }
    }
  }

  var movePieces = function() {
    world.players.forEach(function(player){
      if (player.piece) {
        var oldId = player.piece.id;
        var piece = player.piece.fall(world.grid);
        if (!piece) {
          if (player.piece.checkCollision(world.grid) && player.piece.y == 0) {
            world.reset();
            return;
          }
          player.piece.eachSlot(function(x,y){
            world.grid.cells[y][x].navigable = false;
            world.grid.cells[y][x].color = player.piece.color || '#FFCD34';
          });
          world.checkLines();
          player.getPiece(parseInt(world.width / 2));
          io.sockets.emit('grid-updated', { grid: world.grid.cells });
        }
        io.sockets.emit('player-moved', { player: player });
      }
    });
  }

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
    if (linesToClear.length == 4) io.sockets.emit('tetris');


    if (linesToClear.length > 0) {
      linesToClear.reverse().forEach(function(line){
        clearLine(line);
      });
    }
    io.sockets.emit('grid-updated', { grid: world.grid.cells });
  }

  function clearLine(line) {
    world.grid.cells.splice(line, 1);
    world.grid.cells.unshift(new Grid(world.width, world.height).cells[0]);
    world.lines++;
    io.sockets.emit('line-cleared', { lines: world.lines });
  }

  world.reset = function(){
    world.lines = 0;
    world.grid = new Grid(world.width, world.height);
    world.players.forEach(function(player){
      player.getPiece(parseInt(world.width / 2));
    });
    io.sockets.emit('world-reset', {
      grid: world.grid.cells,
      lines: world.lines
    });
  }

  world.gameLoop = setInterval( movePieces, 300 / ( speed / 2 ) );

  io.on('connection', function(socket) {
    addPlayer(io, socket);
    socket.on('disconnect', function() {
      removePlayer(socket);
    });
  });

};

module.exports = {
  listen: function(server, user) {
    var io = socketio.listen(server, { "log level": 1 });
    return game(io, user);
  }
};
