/*******************************************************************************
*                                                                              *
*      __           __                                                         *
*     /\ \__       /\ \__                           __                         *
*     \ \ ,_\    __\ \ ,_\  _ __   ___     ___ ___ /\_\    ___     ___         *
*      \ \ \/  /'__`\ \ \/ /\`'__\/ __`\ /' __` __`\/\ \ /' _ `\  / __`\       *
*       \ \ \_/\  __/\ \ \_\ \ \//\ \L\ \/\ \/\ \/\ \ \ \/\ \/\ \/\ \L\ \      *
*        \ \__\ \____\\ \__\\ \_\\ \____/\ \_\ \_\ \_\ \_\ \_\ \_\ \____/      *
*         \/__/\/____/ \/__/ \/_/ \/___/  \/_/\/_/\/_/\/_/\/_/\/_/\/___/       *
*                                                                              *
*     Created by:                                                              *
*                                                                              *
*     Nate Goldman                                                             *
*     Sean Harvey                                                              *
*     Chan Park                                                                *
*                                                                              *
*******************************************************************************/

var express = require('express')
  , routes  = require('./routes')
  , app     = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/static', routes.static);

var server = app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var user = {
  name: 'Chuck'
}

var game = require('./game').listen(server, user);
