express = require("express")

app = express()

options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['html', "js"],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: (res, path, stat) -> 
    res.set('x-timestamp', Date.now())
};

app.use(express.static('dist', options));

app.listen 8080, ->
  console.log "Listening on 8080"
  return