express = require("express")
app = express()
app.use express.logger()

# Configuration
app.configure ->
  app.set "views", __dirname + "/app"
  app.set "view engine", "jade"
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + "/app")
  app.use app.router
  app.engine "html", require("ejs").renderFile
  app.use require("connect-assets")()
  return

app.get "/", (request, response) ->
  response.render "index"
  return

app.get "/partials/:name", (req, res) ->
  name = req.params.name
  res.render "partials/" + name
  return
  
app.get "/partials/settings/:name", (req, res) ->
  name = req.params.name
  res.render "partials/settings/" + name
  return
  
app.get "/templates/:name.html", (req, res) ->
  name = req.params.name
  res.render "templates/" + name
  return

env = require('node-env-file')
try
  env(__dirname + '/.env');
catch 

port = process.env.PORT or 3012
app.listen port, ->
  console.log "Listening on " + port
  return