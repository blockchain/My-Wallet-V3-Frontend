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

// App configuration
var app = express();

app.use(function (req, res, next) {
  if (req.url === '/') {
    var cspHeader = ([
      "img-src 'self' " + rootURL + " data:",
      "style-src 'self' 'sha256-vv5i1tRAGZ/gOQeRpI3CEWtvnCpu5FCixlD2ZPu7h84=' 'sha256-47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU='",
      "child-src 'none'",
      "script-src 'self' 'sha256-mBeSvdVuQxRa2pGoL8lzKX14b2vKgssqQoW36iRlU9g=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
      "connect-src 'self' " + rootURL + " " + (webSocketURL || "wss://*.blockchain.info") + " https://api.blockchain.info" + " http://*.blockchain.co.uk",
      "object-src 'none'",
      "media-src 'self' data: mediastream: blob:",
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

app.use(function (req, res) {
  res.status(404).send('<center><h1>404 Not Found</h1></center>');
});

app.listen(port, function () {
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
