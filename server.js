'use strict';

var express         = require('express')
  , ejs             = require('ejs')
  , path            = require('path')

loadEnv('.env');

var port      = process.env.PORT || 8080
  , dist      = parseInt(process.env.DIST) === 1
  , origins   = (process.env.BLOCKCHAIN || '').split(' ')
  , whitelist = (process.env.IP_WHITELIST || '').split(' ')
  , rootURL   = process.env.ROOT_URL || 'https://blockchain.info/'
  , webSocketURL = process.env.WEBSOCKET_URL || false
  , apiDomain = process.env.API_DOMAIN

// App configuration
var rootApp = express();
var app = express();

rootApp.use("/wallet-beta", app);

app.use(function (req, res, next) {
  if (req.url === '/') {
    var cspHeader = ([
      "img-src 'self' " + rootURL + " data:",
      // echo -n "outline: 0;" | openssl dgst -sha256 -binary | base64
      // "outline: 0;"        : ud+9... from ui-select
      // "margin-right: 10px" : 4If ... from ui-select
      // The above won't work in Chrome due to: https://bugs.chromium.org/p/chromium/issues/detail?id=571234
      // Safari throws the same error, but without suggesting an hash to whitelist.
      // Firefox appears to just allow unsafe-inline CSS
      "style-src 'self' 'uD+9kGdg1SXQagzGsu2+gAKYXqLRT/E07bh4OhgXN8Y=' '4IfJmohiqxpxzt6KnJiLmxBD72c3jkRoQ+8K5HT5K8o='",
      "child-src 'none'",
      "script-src 'self' 'sha256-mBeSvdVuQxRa2pGoL8lzKX14b2vKgssqQoW36iRlU9g=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
      "connect-src 'self' " + rootURL + " " + (webSocketURL || "wss://*.blockchain.info") + " " + (apiDomain ||  "https://api.blockchain.info"),
      "object-src 'none'",
      "media-src 'self' https://storage.googleapis.com/bc_public_assets/ data: mediastream: blob:",
      "font-src 'self'", ''
    ]).join('; ');
    res.setHeader('content-security-policy', cspHeader);
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (whitelist != '' && whitelist.indexOf(ip.split(', ')[0]) < 0) {
      console.log(ip);
      res.status(403).send('I\'m sorry Dave, I can\'t let you do that.');
    } else if (dist) {
      res.render('index.html');
    } else {
      res.render('app/index.jade');
    }
    return;

  }
  if (dist) {
    res.setHeader('Cache-Control', 'public, max-age=31557600');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
  }
  next();
});

rootApp.use(function (req, res, next) {
  if (req.url === '/') {
    res.redirect('wallet-beta/');
  } else if (req.url === '/wallet-beta') {
    res.redirect('wallet-beta/');
  } else {
    next();
  }
});

if (dist) {
  console.log('Production mode: single javascript file, cached');
  app.engine('html', ejs.renderFile);
  app.use(express.static('dist'));
  app.set('views', path.join(__dirname, 'dist'));
} else {
  console.log('Development mode: multiple javascript files, not cached');
  app.use(express.static(__dirname));
  app.set('view engine', 'jade');
  app.set('views', __dirname);
}

rootApp.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

app.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

rootApp.listen(port, function () {
  console.log('Listening on %d', port);
});

// Custom middleware
function allowOrigins(origins) {
  return function (req, res, next) {
    origins.forEach(function (origin) {
      if (req.headers.origin != null && req.headers.origin.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      }
    });
    next();
  };
}

// Helper functions
function loadEnv(envFile) {
  try {
    require('node-env-file')(envFile);
  } catch (e) {
    console.log('You may optionally create a .env file to configure the server.');
  }
}
