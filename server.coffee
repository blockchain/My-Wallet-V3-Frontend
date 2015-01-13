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
  app.use (req, res, next) ->
    if req.url == "/"
      res.setHeader "content-security-policy", "img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.youtube.com;; script-src 'self'; connect-src 'self' *.blockchain.info wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com; object-src 'none'; media-src 'self' data: mediastream:; font-src *.blockchain.com:*;"
    next()
  
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
  response.render "index.jade"
  return


server.listen port, ->
  console.log "Listening on " + port
  return