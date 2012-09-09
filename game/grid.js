var Cell = require('./cell');

module.exports = function(width, height) {
  var rows = [];

  for(var i = 0; i < height; i++) {
    var cols = [];
    for(var j = 0; j < width; j++) {
      cell = new Cell();
      cell.x = j;
      cell.y = i;
      cols.push(cell);
    }
    rows.push(cols);
  }

  this.cells  = rows;
  this.height = height;
  this.width  = width;

  this.checkCollision = function(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return rows[y][x].navigable;
  };

};
