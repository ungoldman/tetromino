
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.static = function(req, res){
  res.render('static');
};
