express = require("express")
compression = require('compression')

app = express()

options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', "js"],
  maxAge: '1y',
};

app.use(compression({
  threshold: 512
}))

app.use(express.static(__dirname + '/dist', options));

app.listen 8080, ->
  console.log "Listening on 8080"
  return