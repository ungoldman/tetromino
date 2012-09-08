var socketio = require('socket.io');
var Grid = require('./grid');
var Player = require('./player');
var Piece = require('./piece');

var game = function(io, user) {

  var speed = 1;

  var world = {};
  world.grid = new Grid(11, 18);
  world.players = [];
  world.pieces = [];

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
    if(!world.pieces.length) return;

    world.pieces.forEach(function(piece) {
      piece.move(io.sockets, {world: world, speed: speed});
    });
  }

  setInterval(movePieces, 50);

};

module.exports = {
  listen: function(server, user) {
    var io = socketio.listen(server, { "log level": 1 });
    return game(io, user);
  }
};
