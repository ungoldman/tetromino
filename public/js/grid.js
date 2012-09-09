function Grid(width, height) {
  this.array = [];
  this.width = width;
  this.height = height;
  
  for (var i = 0; i < height; i++) {
    this.array[i] = [];
    for (var j = 0; j < width; j++) {
      this.array[i][j] = null;
    }
  }
}

Grid.prototype.render = function(context) {
  array = this.array;
  this.eachFilledSlot(function(i, j) {
    context.fillStyle = array[i][j];
    context.fillRect (j * 20, i * 20, 20, 20);
  });
}

Grid.prototype.populate = function(piece) {
  array = this.array;
  piece.eachSlot(function(i, j) {
    array[i][j] = piece.color;
  });
}

Grid.prototype.checkLines = function() {
  resetStart = null;
  resetEnd = null;
  
  for (i = this.array.length -1; i >= 0; i--) {
    complete = true;
    for (j = 0; j < this.array[i].length; j++) {
      if (this.array[i][j] == null) complete = false;
    }
    if (resetStart == null) {
      if (complete) resetStart = i;
    } else {
      if (!complete) {
        resetEnd = i +1;
        break;
      }
    }
  }

  if (resetStart && resetEnd) {
    this.resetLines(resetStart, resetEnd);
  }
}

Grid.prototype.resetLines = function(start, end) {
  difference = (start - end + 1);
  incrementScore(difference);
  for (i = start - difference; i >= 0; i--) {
    this.copyLine(i + difference, i);
  }
}

Grid.prototype.copyLine = function(lineTo, lineFrom) {
  for (j = 0; j < this.array[lineFrom].length; j++) {
    this.array[lineTo][j] = this.array[lineFrom][j];
  }
}

Grid.prototype.eachFilledSlot = function(closure) {
  for (i = 0; i < this.array.length; i++) {
    for (j = 0; j < this.array[i].length; j++) {
      if (this.array[i][j] != null) {
        closure(i, j);
      }
    }
  }
}

Grid.prototype.debug = function() {
  text = "";
  for (i = 0; i < array.length; i++) {
    for (j = 0; j < array[i].length; j++) {
      text += (array[i][j] != null) ? '1' : '0';
    }
    text += '<br/>';
  }
  return text;
}
