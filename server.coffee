express = require("express")
compression = require('compression')
app = express()
app.use express.logger()

app.use(compression({
  threshold: 512
}))

env = require('node-env-file')
try
  env(__dirname + '/.env');
catch e
  console.log("You may optionally create a .env file to configure the server.");
  
port = process.env.PORT or 8080

dist = process.env.DIST? && parseInt(process.env.DIST)

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
# port = process.env.PORT or 443

#############
# End HTTPS #
#############

# Configuration
app.configure ->
  app.use (req, res, next) ->
    if req.url == "/"
      res.setHeader "content-security-policy", "img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.youtube.com;; script-src 'self'; connect-src 'self' *.blockchain.info wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com; object-src 'none'; media-src 'self' data: mediastream:; font-src local.blockchain.com:* dev.blockchain.info;"
    else if dist
      res.setHeader('Cache-Control', 'public, max-age=31557600');
    next()
    
  app.use app.router  
  app.engine "html", require("ejs").renderFile
    
  if dist
    console.log("Production mode: single javascript file, cached");
    app.set "views", __dirname + "/dist"
    app.use(express.static(__dirname + '/dist'));
  else
    console.log("Development mode: multiple javascript files, not cached");
    app.set "view engine", "jade"
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.set "views", __dirname + "/app"
    app.use express.static(__dirname + "/app")
    app.use require("connect-assets")()
  
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )
  
  return

if process.env.BETA? && parseInt(process.env.BETA)
  console.log("Enabling beta invite system")
  # beta key public
  betaKeyDB = undefined
  
  if dist
    betaKeyDB = require(__dirname + '/dist/beta/betaAdminServer')
  else
    betaKeyDB = require(__dirname + '/app/beta/betaAdminServer')

  app.get "/", (request, response) ->
    console.log("Knock knock")
    if not request.query.key
      if dist
        console.log("beta.html")
        response.render "beta.html"
      else
        response.render "beta.jade"
      return
    else
      console.log("verified?", request.query.key)
      
      betaKeyDB.doesKeyExist request.query.key, (verified) ->
        console.log("verified...",request.query.key)
        
        if verified == true
          if dist
            response.render "index.html"
          else
            response.render "index.jade"
        else
          response.end "could not authorize beta key"

  # beta key admin

  app.get "/betaadmin", (request, response) ->
    if dist
      response.render "admin.html"
    else
      response.render "admin.jade"
    return

  app.get "/betaadmin/:method", (request, response) ->
    if request.params.method == 'get-all-keys'
      betaKeyDB.getAllKeys (err, rows) ->
        response.end JSON.stringify(rows)
    else if request.params.method == 'get-sorted-keys'
      betaKeyDB.getSortedKeys request.query.sort, (err, rows) ->
        response.end JSON.stringify(rows)
    else if request.params.method == 'assign-key'
      betaKeyDB.assignNewKey request.query.name, request.query.email, (key) ->
        response.end JSON.stringify({key:key})
    else if request.params.method == 'delete-key'
      betaKeyDB.deleteKeyById request.query.id, (err) ->
        response.end JSON.stringify({error:err})
else
  app.get "/", (request, response) ->
    console.log("Slash, not beta...")
    if dist
      response.render "index.html"
    else
      response.render "index.jade"
      
app.listen port, ->
  console.log "Listening on " + port
  return