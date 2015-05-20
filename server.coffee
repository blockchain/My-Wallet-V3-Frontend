express = require("express")
compression = require('compression')
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

# Configuration
app.configure ->
  app.use (req, res, next) ->
    if req.url == "/"
      res.setHeader "content-security-policy", "img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.youtube.com; script-src 'self'; connect-src 'self' *.blockchain.info *.blockchain.com wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com; object-src 'none'; media-src 'self' data: mediastream:; font-src 'self'"
    if req.url.indexOf("beta_key")
      # Don't cache these
      res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
    else if dist
      res.setHeader('Cache-Control', 'public, max-age=31557600');
    else
      res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
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
    app.set "views", __dirname
    app.use express.static(__dirname)
  
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
      response.render "app/index.jade"
      
  app.get "/percent_requested", (request, response) ->
    response.setHeader 'Access-Control-Allow-Origin', (process.env.BLOCKCHAIN || 'http://blockchain.com')
    response.json { width: (process.env.PERCENT_REQUESTED || 60) }

  app.get "/request_beta_key", (request, response) ->
    response.setHeader 'Access-Control-Allow-Origin', (process.env.BLOCKCHAIN || 'http://blockchain.com')
    userEmail = request.query.email
    if (parseInt(process.env.PERCENT_REQUESTED) != 100)
      if (/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(userEmail))
        hdBeta.requestKey userEmail, (err) ->
          if !err
            response.json { message: 'Successfully submitted request', success: true }
          else
            response.json { message: 'Error requesting key', success: false }
      else
        response.json { message: 'Invalid email address', success: false }
    else
      response.json { message: 'Beta key request limit reached', success: false }

  app.post "/check_beta_key_unused", (request, response) ->
    hdBeta.verifyKey request.body.key, (err, verified) ->
      if err
        response.json {verified : false, error: {message: err}}
      else if verified
        hdBeta.doesKeyExistWithoutGUID request.body.key, (err, verified, email) ->
          if verified
            response.json {verified : true, email: email}
          else
            response.json {verified : false, error: {message: "Invite key already used. Please login instead."}}
      else
        response.json {verified : false, error: {message: "Invite key not found"}}
    
  app.post "/check_guid_for_beta_key", (request, response) ->
    hdBeta.isGuidAssociatedWithBetaKey request.body.guid, (err, verified) ->
      if err
        response.json {verified : false, error: {message: "There was a problem verifying your invite key. Please try again later.", err }}
      else if verified
        response.json {verified : true}
      else
        response.json {verified : false, error: {message: "This wallet is not associated with a beta invite key. Please create a new wallet first."}}
        
  app.post "/set_guid_for_beta_key", (request, response) ->
    hdBeta.doesKeyExistWithoutGUID request.body.key, (err, unclaimed, email) ->
      if err
        response.json {success : false, error: {message: err}}
      else if unclaimed
        hdBeta.setGuid request.body.key, request.body.guid, () ->
          response.json {success : true}
      else
        response.json {success : false}

  # beta key admin

  app.get "/admin/?", (request, response, next) ->
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
        response.render "app/admin.jade"      

  app.get "/admin/api/:method", (request, response, next) ->
    credentials = auth(request)
    
    if (!credentials || credentials.name != 'blockchain' || credentials.pass != process.env.ADMIN_PASSWORD) 
      response.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="blockchain-beta-admin"'
      })
      response.end()
    else
      # get-all-keys depricated
      if request.params.method == 'get-all-keys'
        hdBeta.getKeys (err, data) ->
          response.send JSON.stringify data

      else if request.params.method == 'get-sorted-keys'
        hdBeta.getKeys request.query, (err, data) ->
          response.json { error: err, data: data }

      else if request.params.method == 'assign-key'
        hdBeta.assignKey request.query.name, request.query.email, request.query.guid, (err, key) ->
          response.json { error: err, key: key }

      else if request.params.method == 'delete-key'
        hdBeta.deleteKey request.query, (err) ->
          response.json { error: err }

      else if request.params.method == 'update-key'
        hdBeta.updateKey request.query.selection, request.query.update, (err) ->
          response.json { error: err }

      else if request.params.method == 'activate-key'
        hdBeta.activateKey request.query.selection, request.query.update, (err) ->
          response.json { error: err }

      else if request.params.method == 'set-percent-requested'
        process.env.PERCENT_REQUESTED = parseInt(request.query.percent)
        response.json {success: true}
        
else
  app.get "/", (request, response) ->
    if dist
      response.render "index.html"
    else
      response.render "app/index.jade"
      
app.listen port, ->
  console.log "Listening on " + port
  return
