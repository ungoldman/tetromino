var autoId = 0;

module.exports = function() {
  return {
    id: 't'+autoId++,
    navigable: true
  }
}
