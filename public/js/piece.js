var pieces = [
  {
    grids: [[
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],  [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ],  [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],  [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]], 
    color: '#f00'
  }, {
    grids: [[
      [1, 1],
      [1, 1]
    ]],
    color: '#0f0'
  }, {
    grids: [[
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ], [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ], [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ], [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]],
    color: '#00f'
  }, {
    grids: [[
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ], [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ], [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ]],
    color: '#0ff'
  }, {
    grids: [[
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ], [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]],
    color: '#ccc'
  }, {
    grids: [[
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ]],
    color: '#f0f'
  }, {
    grids: [[
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]],
    color: '#fc9'
  }
];

function randomType() {
  return Math.floor(Math.random() * pieces.length);
}


function Piece(x, y, type) {
  this.y = y;
  this.x = x;
  this.rotation = 0;
  this.grids = pieces[type].grids;
  this.color = pieces[type].color;
}

Piece.prototype.render = function(context) {
  var color = this.color;
  this.eachSlot(function(i, j) {
    context.fillStyle = color;
    context.fillRect (j * 20, i * 20, 20, 20);
  });
}

Piece.prototype.fall = function() {
  oldY = this.y;
  this.y += 1;
  if (this.checkCollision()) {
    this.y = oldY;
    grid.populate(this);
    grid.checkLines();
    piece = new Piece(4, 0, randomType());
    if (piece.checkCollision()) {
      gameOver();
      piece = null;
      render();
    }
  }
  render();
}

Piece.prototype.move = function(x) {
  var oldX = this.x;
  this.x += x;
  if (this.checkCollision()) this.x = oldX;
  render();
}

Piece.prototype.rotate = function() {
  oldRotation = this.rotation;
  this.rotation = (this.rotation +1) % this.grids.length;
  if (this.checkCollision()) this.rotation = oldRotation;
  render();
}

Piece.prototype.checkCollision = function() {
  var result = false;
  this.eachSlot(function(i, j) {
    if (j < 0 || j > grid.width -1 || i > grid.height -1 || grid.array[i][j] != null) result = true;
  });
  return result;
}

Piece.prototype.eachSlot = function(closure) {
  for (i = 0 ; i < this.grids[this.rotation].length; i++) {
    for (j = 0; j < this.grids[this.rotation][i].length; j++) {
      if (this.grids[this.rotation][i][j] == 1) {
        closure(this.y + i, this.x + j);
      }
    }
  }
}
