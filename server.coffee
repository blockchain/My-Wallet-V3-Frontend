express = require("express")
compression = require('compression')
app = express()
bodyParser = require('body-parser')
auth = require('basic-auth')
path = require('path')
r = require('request');
fs = require('fs')

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
      # Inline style hashes, in case we want to remove unsafe-inline:
      # 'sha256-vv5i1tRAGZ/gOQeRpI3CEWtvnCpu5FCixlD2ZPu7h84=' : angular-charts
      # 'sha256-47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU=' : angular-charts
      # lots... : jQuery
      res.setHeader "content-security-policy", "img-src 'self' data:; style-src 'self' 'unsafe-inline'; child-src 'none'; script-src 'self' 'sha256-mBeSvdVuQxRa2pGoL8lzKX14b2vKgssqQoW36iRlU9g=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='; connect-src 'self' *.blockchain.info *.blockchain.com wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com; object-src 'none'; media-src 'self' data: mediastream: blob:; font-src 'self'"
      res.setHeader "X-Frame-Options", "SAMEORIGIN"
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

  origins = (process.env.BLOCKCHAIN || '').split(' ')
  setHeaderForOrigin = (req, res, origins) ->
    for o in origins
      if req.headers.origin? && req.headers.origin.indexOf(o) > -1
        res.setHeader 'Access-Control-Allow-Origin', req.headers.origin

  # beta key public

  app.get "/", (request, response) ->
    if dist && process.env.BETA?
      response.render "index-beta.html"
    else if dist
      response.render "index.html"
    else
      response.render "app/index.jade"

  app.get "/percent_requested", (request, response) ->
    setHeaderForOrigin request, response, origins
    response.json { width: (process.env.PERCENT_REQUESTED || 60) }

  app.get "/request_beta_key", (request, response) ->
    setHeaderForOrigin request, response, origins
    userEmail = request.query.email
    if (parseInt(process.env.PERCENT_REQUESTED) != 100)
      if (/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(userEmail))
        ios = if request.query.ios == 'true' || request.query.ios == true then true else false
        android = if request.query.android == 'true' || request.query.android == true then true else false
        hdBeta.attemptToRequestKey userEmail, { ios: ios, android: android }, (err) ->
          if !err
            response.json { message: 'Successfully submitted request', success: true }
          else
            response.json { message: err, success: false }
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

  app.post "/verify_wallet_created", (request, response) ->
    hdBeta.newWalletCreated request.body.key, (err) ->
      if err
        response.json {success : false, error: {message: err}}
      else
        response.json {success : true}

  app.post '/whitelist_guid', (request, response) ->
    if !request.body?
      response.json { error: 'no request body' }
    else if request.body.secret != process.env.WHITELIST_SECRET
      response.json { error: 'incorrect secret' }
    else if !request.body.guid?
      response.json { error: 'missing request body guid parameter' }
    else
      name = request.body.name || 'Mobile Tester'
      hdBeta.assignKey name, request.body.email, request.body.guid, (err, key) ->
        response.json { error: err, key: key }

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

      else if request.params.method == 'activate-all'
        range = [request.query.min || 0, request.query.max || 100000]
        hdBeta.activateAll range, (err, data) ->
          response.json { error: err, data: data }

      else if request.params.method == 'resend-activation'
        hdBeta.resendActivationEmail request.query.key, (err) ->
          response.json { error: err }

      else if request.params.method == 'resend-many'
        range = [request.query.min || 0, request.query.max || 100000]
        hdBeta.resendMany range, (err, data) ->
          response.json { error: err, data: data }

      else if request.params.method == 'wallets-created'
        hdBeta.fetchNumWalletsCreated (err, count) ->
          response.json { error: err, count: count }

      else if request.params.method == 'get-csv'
        hdBeta.fetchCSV {}, (err, csv) ->
          fs.writeFileSync 'tmp.csv', csv
          response.download 'tmp.csv', 'emails.csv', () ->
            fs.unlink 'tmp.csv'

      else if request.params.method == 'set-percent-requested'
        percent = parseInt(request.query.percent)
        isNumber = not isNaN(percent)
        if isNumber
          process.env.PERCENT_REQUESTED = percent
        response.json { success: Boolean(isNumber) }
else
  app.get "/", (request, response) ->
    if dist
      response.render "index.html"
    else
      response.render "app/index.jade"

# /verify-email?token=$token sends a request to blockchain.info and redirects to login
app.get "/verify-email", (request, response) ->
  r.get 'https://blockchain.info/wallet' + request.originalUrl
  response.cookie 'email-verified', true
  response.redirect '/'

# /authorize-approve?token=$token sends a request to blockchain.info and redirects to login
app.get "/authorize-approve", (request, response) ->
  response.send """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Verifying authorization request</title>
    <script>
      var xmlHttp = new XMLHttpRequest();
      // The redirect should be done in the callback, but currently the callback doesn't get called because the authorize-approve page makes an ajax request to /wallet over http which is blocked
      // xmlHttp.onload = function () {
      //   window.location.replace("/");
      // };
      xmlHttp.open("GET", "https://blockchain.info/wallet#{request.originalUrl}", true);
      xmlHttp.send();

      setTimeout(function() { window.location.replace("/"); }, 500);
    </script>
  </head>
</html>
"""
# pass the feedback post to jira
app.post "/feedback", (request, response) ->
  jira = 'https://blockchain.atlassian.net/rest/collectors/1.0/template/feedback/e6ce4d72'
  headers = { 'X-Atlassian-Token' : 'nocheck' }
  r.post { url: jira, headers: headers, form: request.body }, (err, httpResponse, body) ->
    response.json { success: !(err?) }

# /unsubscribe?token=$token sends a request to blockchain.info and redirects to login
app.get "/unsubscribe", (request, response) ->
  r.get 'https://blockchain.info/wallet' + request.originalUrl
  response.redirect '/'

# *.blockchain.info/guid fills in the guid on the login page
app.get /^\/.{8}-.{4}-.{4}-.{4}-.{12}$/, (request, response) ->
  response.cookie 'uid', '"' + request.path.split(path.sep)[1] + '"'
  response.redirect '/'

# *.blockchain.info/key-{key} brings the user to the register page and fills in the key
app.get /^\/key-.{8}$/, (request, response) ->
  response.cookie 'key', '"' + request.path.split(path.sep)[1].split('-')[1] + '"'
  response.redirect '/'

# TODO Better 404 page
app.use (req, res) ->
  res.send '<center><h1>404 Not Found</h1></center>'

app.listen port, ->
  console.log "Listening on " + port
  return
