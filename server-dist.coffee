express = require("express")
compression = require('compression')
fs = require('fs')

app = express()

app.use(compression({
  threshold: 512
}))

app.configure ->  
  app.use (req, res, next) ->
    if req.url == "/"
      res.setHeader "content-security-policy", "img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.youtube.com;; script-src 'self'; connect-src 'self' *.blockchain.info wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com; object-src 'none'; media-src 'self' data: mediastream:; font-src local.blockchain.com:* dev.blockchain.info;"
    else
      res.setHeader('Cache-Control', 'public, max-age=31557600');
    next()

  app.set "views", __dirname + "/dist"
  app.use app.router  
  app.engine "html", require("ejs").renderFile
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )
  return

# <== beta changes start ==>
# beta key public

betaKeyDB = require(__dirname + '/dist/beta/betaAdminServer')

app.get "/", (request, response) ->
  if not request.query.key
    response.render "beta.html"
    return
  else
    betaKeyDB.doesKeyExist request.query.key, (verified) ->
      if verified == true
        response.render "index.html"
      else
        response.end "could not authorize beta key"

app.get "/beta/betaAdminClient.js", (request, response) ->
  response.send fs.readFileSync(__dirname + '/dist/beta/betaAdminClient.js')
  return

# beta key admin

app.get "/betaadmin", (request, response) ->
  response.render "admin.html"
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

# <== beta changes end ==>

app.listen 8080, ->
  console.log "Listening on 8080"
  return