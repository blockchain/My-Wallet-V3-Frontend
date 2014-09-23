var express = require("express");
 
var app = express();
app.use(express.logger());

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/app');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/app'));
  app.use(app.router);
  app.engine('html', require('ejs').renderFile);
});

app.get('/', function(request, response) {
  response.render('index')
});

app.get('/partials/:name', function (req, res)
 { var name = req.params.name;
   res.render('partials/' + name);
});

var port = process.env.PORT || 3012;
app.listen(port, function() {
  console.log("Listening on " + port);
});
