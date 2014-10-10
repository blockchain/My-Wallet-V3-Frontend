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
  
env = require('node-env-file')
env(__dirname + '/.env');

port = process.env.PORT or 3012
app.listen port, ->
  console.log "Listening on " + port
  return