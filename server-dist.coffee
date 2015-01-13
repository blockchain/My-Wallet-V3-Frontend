express = require("express")

app = express()

options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', "js"],
  index: false,
  maxAge: '1y',
  redirect: false,
};

app.use(express.static('dist', options));

app.listen 8080, ->
  console.log "Listening on 8080"
  return