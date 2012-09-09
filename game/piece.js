var autoId = 0;

module.exports = Piece = function(){
  var type = this.randomType();
  this.id = 'piece'+autoId++;
  this.y = 0;
  this.x = 4;
  this.rotation = 0;
  this.positions = pieces[type].positions;
  this.color = pieces[type].color;
  this.type = pieces[type].name;
};

// this is the array that determines all shapes
// positions represent the different rotations of each piece
var pieces = [
  {
    name: 'T-shape',
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
    name: 'square',
    positions: [[
      [1, 1],
      [1, 1]
    ]],
    color: '#0f0'
  }, {
    name: 'L-shape',
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
    name: 'reverse L-shape',
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
    name: 'the long one',
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
    name: 'S-shape',
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
    name: 'Z-shape',
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
Piece.prototype.fall = function(grid) {
  // save old vertical position
  var oldY = this.y;
  // increment vertical position by 1
  this.y += 1;
  // this is checking if the new Y coordinate is causing a collision
  if (this.checkCollision(grid)) {
    this.y = oldY;
    // Lock piece to grid
    // grid.populate(this);
    // Check to see if any line were completed
    // grid.checkLines();
    // this is creating a new piece and checking if it it's causing a collision
    // var piece = new Piece();
    // if (piece.checkCollision()) {
      // if the new piece is colliding with something right away, it's game over
      // gameOver();
      // piece = null;
    // }
  }
  // Returns the piece itself
  return this;
}
// piece.move()
Piece.prototype.move = function(direction, grid) {
  var increment = direction == ('left' || -1) ? -1 : 1;
  // Grab current position
  var oldX = this.x;
  // Add the increment of either +1 or -1 to the piece's current position
  this.x += increment;

  // If this causes a collision, give the piece it's old x position
  if (this.checkCollision(grid)) this.x = oldX;
  // Returns the piece itself
  return this;
}

// piece.rotate accepts a direction parameter of 'left' or 'right' (or -1).
// It then changes the position of the piece accordingly. If a collision is
// detected, it reverts back to the old rotation.
Piece.prototype.rotate = function(direction, grid) {
  // defaults to 1, equivalent of right rotation.
  var increment = direction == ('left' || -1) ? -1 : 1;
  // temporarily save old rotation
  var oldRotation = this.rotation;
  // modulus makes sure rotation is always between 0 and 3
  this.rotation = (this.rotation + increment) % this.positions.length;
  // make sure rotation is positive
  if (this.rotation == -1) this.rotation = this.positions.length - 1;
  // collision check
  if (this.checkCollision(grid)) {
    // set to old rotation if collision is detected
    this.rotation = oldRotation;
  }
  // return piece
  return this;
}

// piece.checkCollision compares the current state of the piece to the grid
// to make sure there is no overlap. It returns true if a collision is detected.
Piece.prototype.checkCollision = function(grid) {
  var result = false;
  this.eachSlot(function(x, y) {
    if (x < 0 || x > grid.width -1 || y > grid.height -1 || grid.cells[x] && !grid.cells[x][y].navigable) {
      result = true;
    }
  });
  return result;
}

// Piece.eachSlot allows you to cycle through the array
// representing the current position of the piece and pass a callback at
// each interval
Piece.prototype.eachSlot = function(callback) {
  for (i = 0; i < this.positions[this.rotation].length; i++) {
    for (j = 0; j < this.positions[this.rotation][i].length; j++) {
      if (this.positions[this.rotation][i][j] == 1) {
        callback(this.x + i, this.y + j);
      }
    }
  }
}
