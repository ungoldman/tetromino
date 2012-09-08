var autoId = 0;

var Piece = function(){
  var type = this.randomType();
  this.id = 'piece'+autoId++;
  this.y = 4;
  this.x = 0;
  this.rotation = 0;
  this.positions = pieces[type].positions;
  this.color = pieces[type].color;
};

// this is the array that determines all shapes
// positions represent the different rotations of each piece
var pieces = [
  {
    positions: [[
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
    positions: [[
      [1, 1],
      [1, 1]
    ]],
    color: '#0f0'
  }, {
    positions: [[
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
    positions: [[
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
    positions: [[
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
    positions: [[
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
    positions: [[
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

Piece.prototype.randomType = function(){
  return Math.floor(Math.random() * pieces.length);
}

// piece.fall()
Piece.prototype.fall = function() {
  var oldY = this.y;
  this.y += 1;
  // this is checking if the new Y coordinate is causing a collision
  if (this.checkCollision()) {
    this.y = oldY;
    // Lock piece to grid
    grid.populate(this);
    // Check to see if any line were completed
    grid.checkLines();
    // this is creating a new piece and checking if it it's causing a collision
    var piece = new Piece();
    if (piece.checkCollision()) {
      // if the new piece is colliding with something right away, it's game over
      gameOver();
      piece = null;
    }
  }
}
// piece.move()
Piece.prototype.move = function(direction) {
  var increment = direction == ('left' || -1) ? -1 : 1;
  // Grab current position
  var oldX = this.x;
  // Add the increment of either +1 or -1 to the piece's current position
  this.x += increment;
  // If this causes a collision, give the piece it's old x position
  if (this.checkCollision()) this.x = oldX;
  // Returns the piece itself
  return this;
}

// piece.rotate accepts a direction parameter of 'left' or 'right' (or -1).
// It then changes the position of the piece accordingly. If a collision is
// detected, it reverts back to the old rotation.
Piece.prototype.rotate = function(direction) {
  // defaults to 1, equivalent of right rotation.
  var increment = direction == ('left' || -1) ? -1 : 1;
  // temporarily save old rotation
  var oldRotation = this.rotation;
  // modulus makes sure rotation is always between 0 and 3
  this.rotation = (this.rotation + increment) % this.positions.length;
  // collision check
  if (this.checkCollision()) {
    // set to old rotation if collision is detected
    this.rotation = oldRotation;
  }
  // return piece
  return this;
}

// piece.checkCollision compares the current state of the piece to the grid
// to make sure there is no overlap. It returns true if a collision is detected.
Piece.prototype.checkCollision = function() {
  var result = false;
  this.eachSlot(function(i, j) {
    if (j < 0 || j > grid.width -1 || i > grid.height -1 || grid.array[i][j] != null) {
      result = true;
    }
  });
  return result;
}

// Piece.eachSlot allows you to cycle through the array
// representing the current position of the piece and pass a callback at
// each interval
Piece.prototype.eachSlot = function(callback) {
  for (i = 0 ; i < this.positions[this.rotation].length; i++) {
    for (j = 0; j < this.positions[this.rotation][i].length; j++) {
      if (this.positions[this.rotation][i][j] == 1) {
        callback(this.y + i, this.x + j);
      }
    }
  }
}

module.exports = Piece;
