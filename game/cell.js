var autoId = 0;

module.exports = Cell = function() {
  return {
    id: 'cell'+autoId++,
    navigable: true,
    color: '#fafafa'
  }
}
