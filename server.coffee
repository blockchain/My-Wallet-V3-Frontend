express = require("express")
app = express()
app.use express.logger()
server = app

env = require('node-env-file')
try
  env(__dirname + '/.env');
catch 

port = env.PORT or 8080

#########
# HTTPS #
#########

# fs = require('fs')
# https = require('https')
# socket = require('socket.io')
# sslOptions = {
#     key: fs.readFileSync(__dirname + '/ssl_dev/server.key'),
#     cert: fs.readFileSync(__dirname + '/ssl_dev/server.crt'),
#     honorCipherOrder: true
#     ca: fs.readFileSync(__dirname + '/ssl_dev/ca.crt'),
#     requestCert: true,
#     rejectUnauthorized: false
# }
# server = https.createServer(sslOptions, app)
# io = socket.listen(server, {
#     "log level" : 3,
#     "match origin protocol" : true,
#     "transports" : ['websocket']
# })
# port = env.PORT or 443

#############
# End HTTPS #
#############

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



server.listen port, ->
  console.log "Listening on " + port
  return