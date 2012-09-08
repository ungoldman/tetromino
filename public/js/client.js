var socket = io.connect(window.location.hostname);
var world;

socket.on('game-enter', function(data){
  console.log('game entered', data);
  world = data;

  var directions = ['left','right'];

  $.map(directions, function(direction, index){
    key(direction, function(e) {
      e.preventDefault();
      console.log('player moving', direction);
      socket.emit('player-move', { direction: directions[index] });
    });
  });

  key('down', function(e){
    e.preventDefault();
    console.log('player moving down');
    socket.emit('player-fall');
  });

});

socket.on('player-moved', function(data) {
  console.log('player moved', data);
  // var you = false;
  // if(data.player.id === world.player.id) {
  //   world.player.location = data.player.location;
  //   world.player.dir = data.player.dir;
  //   you = true;
  // }
  // renderPlayer(data.player, you);
});

socket.on('player-quit', function(data){
  //removePlayer(data.player);
  console.log('player quit', data);
});

/* Helper Methods */

var renderMap= function(map) {
  $world = $(".world");
  $world.empty();
  for(var i = 0; i < map.length; i++) {
    $row = $("<div>").addClass("row");
    $world.append($row);
    for(var j = 0; j < map[i].length; j++) {
      var $cell = $("<div>").addClass('cell');
      $row.append($cell.addClass(map[i][j].material));
    }
  }
};

var renderPlayer = function(player, you) {
  var move = true;
  var $el = $("#"+player.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', player.id).addClass('player').hide().appendTo('.world');
    if(you) $el.addClass('you');
    move = false;
  }
  var offset = $(".row:eq("+player.location.y+") .cell:eq("+player.location.x+")").position();
  if(move) {
    $el.animate(offset, 500/player.speed, "linear");
  } else {
    $el.css(offset).fadeIn();
  }

  // if(player.dir) {
  //   var angle = "180deg";
  //   if(player.dir === 'right') angle = '270deg';
  //   else if(player.dir === 'up') angle = '0deg';
  //   else if(player.dir === 'left') angle = '90deg';

  //   $el.css('transform', 'rotate('+angle+')');
  // }
  if(you) {
    if ($el.offset().top > 480) $('html,body').stop().animate({scrollTop: 640},500);
    if ($el.offset().top < 480) $('html,body').stop().animate({scrollTop: 0},500);
  }
};

var renderPlayers = function(players) {
  for(var i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

var killPlayer = function(player, killer) {
  var $el = $("#"+player.id).addClass('splode');
  $el.fadeOut(500, function() { $(this).remove() });
};

var removePlayer = function(player) {
  $("#"+player.id).remove();
};

var renderBullet = function(bullet) {
  var move = true;
  var $el = $("#"+bullet.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', bullet.id).addClass('bullet').hide().appendTo('.world');
    move = false;
  }
  var offset = $(".row:eq("+bullet.location.y+") .cell:eq("+bullet.location.x+")").position();
  if(move) {
    $el.animate(offset, 100, "linear");
  } else {
    $el.css(offset).show();
  }
};

var removeBullet = function(bullet) {
  $("#"+bullet.id).remove();
}

var toast = function(message) { $().toastmessage('showNoticeToast', message); };
