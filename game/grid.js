var Cell = require('./cell');

module.exports = function(width, height) {
  var rows = [];
  var cols;

  for(var i = 0; i < height; i++) {
    cols = [];
    for(var j = 0; j < width; j++) {
      cell = new Cell();
      cell.x = j;
      cell.y = i;
      cols.push(cell);
    }
    rows.push(cols);
  }

  return {
    cells: rows,
    isNavigable: function(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      return rows[y][x].navigable;
    }
  }

};
