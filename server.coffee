express = require("express")
compression = require('compression')
Guid = require('node-uuid')
sqlite3 = require('sqlite3').verbose()
app = express()
bodyParser = require('body-parser')
auth = require('basic-auth')
basic = undefined
app.use express.logger()
app.use( bodyParser.json() )

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
    else if req.url.indexOf("beta_key")
      # Don't cache these
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

  hdBeta = require('hd-beta')(__dirname + '/' + process.env.BETA_DATABASE_PATH)
  
  # beta key public

  app.get "/", (request, response) ->
    if dist && process.env.BETA?
      response.render "index-beta.html"
    else if dist
      response.render "index.html"  
    else
      response.render "index.jade"
      
  app.post "/check_beta_key_unused", (request, response) ->
    hdBeta.verifyKey request.body.key, (verified) ->
      if verified
        hdBeta.doesKeyExistWithoutGUID request.body.key, (verified, email) ->
          if verified
            response.json {verified : true, email: email}
          else
            response.json {verified : false, error: {message: "Invite key already used. Please login instead."}}
      else
        response.json {verified : false, error: {message: "Invite key not found"}}
        

    
  app.post "/check_guid_for_beta_key", (request, response) ->
    hdBeta.isGuidAssociatedWithBetaKey request.body.guid, (verified) ->
      if verified
        response.json {verified : true}
      else
        response.json {verified : false, error: {message: "This wallet is not associated with a beta invite key. Please create a new wallet first."}}
        
  app.post "/set_guid_for_beta_key", (request, response) ->
    hdBeta.doesKeyExistWithoutGUID request.body.key, (unclaimed, email) ->
      if unclaimed
        hdBeta.setGuid request.body.key, request.body.guid, () ->
          response.json {success : true}
      else
        response.json {success : false}

  # beta key admin

  app.get "/betaadmin/", (request, response, next) ->
    credentials = auth(request)
    
    if (!credentials || credentials.name != 'blockchain' || credentials.pass != process.env.ADMIN_PASSWORD) 
      response.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="blockchain-beta-admin"'
      })
      response.end()
    else
      if dist
        response.render "admin.html"
      else
        response.render "admin.jade"      

  app.get "/betaadmin/api/:method", (request, response, next) ->
    credentials = auth(request)
    
    if (!credentials || credentials.name != 'blockchain' || credentials.pass != process.env.ADMIN_PASSWORD) 
      response.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="blockchain-beta-admin"'
      })
      response.end()
    else
      if request.params.method == 'get-all-keys'
        hdBeta.getKeys (data) ->
          response.send JSON.stringify data
      else if request.params.method == 'get-sorted-keys'
        hdBeta.getKeys request.query, (data) ->
          response.end JSON.stringify data
      else if request.params.method == 'assign-key'
        hdBeta.assignKey request.query.name, request.query.email, request.query.guid, (key) ->
          response.end JSON.stringify({key:key})
      else if request.params.method == 'delete-key'
        hdBeta.deleteKey { rowid: parseInt(request.query.rowid) }, () ->
          response.json {success: true}
      else if request.params.method == 'update-key'
        hdBeta.updateKey request.query.selection, request.query.update, () ->
          response.json {success: true}
        
else
  app.get "/", (request, response) ->
    if dist
      response.render "index.html"
    else
      response.render "index.jade"
      
app.listen port, ->
  console.log "Listening on " + port
  return