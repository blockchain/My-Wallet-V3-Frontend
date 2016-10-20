'use strict';

var express = require('express');
var ejs = require('ejs');
var path = require('path');
var compression = require('compression');

loadEnv('.env');

var port = process.env.PORT || 8080;
var dist = parseInt(process.env.DIST, 10) === 1;
var rootURL = process.env.ROOT_URL || 'https://blockchain.info';
var webSocketURL = process.env.WEBSOCKET_URL || false;
var apiDomain = process.env.API_DOMAIN;
var iSignThisDomain = rootURL === 'https://blockchain.info' ? 'https://verify.isignthis.com/' : 'https://stage-verify.isignthis.com/';

// App configuration
var rootApp = express();
var app = express();

app.use(compression());

rootApp.use('/:lang?/wallet', app);

rootApp.get('/:lang?/search', (req, res) => {
  res.redirect(`${rootURL}/search?search=${req.query.search}`);
});

app.use(function (req, res, next) {
  if (req.url === '/') {
    var cspHeader = ([
      "img-src 'self' " + rootURL + ' data: blob:',
      // echo -n "outline: 0;" | openssl dgst -sha256 -binary | base64
      // "outline: 0;"        : ud+9... from ui-select
      // "margin-right: 10px" : 4If ... from ui-select
      // The above won't work in Chrome due to: https://bugs.chromium.org/p/chromium/issues/detail?id=571234
      // Safari throws the same error, but without suggesting an hash to whitelist.
      // Firefox appears to just allow unsafe-inline CSS
      "style-src 'self' 'uD+9kGdg1SXQagzGsu2+gAKYXqLRT/E07bh4OhgXN8Y=' '4IfJmohiqxpxzt6KnJiLmxBD72c3jkRoQ+8K5HT5K8o='",
      'child-src ' + iSignThisDomain,
      'frame-src ' + iSignThisDomain,
      "script-src 'self' ",
      'connect-src ' + [
        "'self'",
        rootURL,
        (webSocketURL || 'wss://*.blockchain.info'),
        (apiDomain || 'https://api.blockchain.info'),
        'https://app-api.coinify.com'
      ].join(' '),
      "object-src 'none'",
      "media-src 'self' https://storage.googleapis.com/bc_public_assets/ data: mediastream: blob:",
      "font-src 'self'", ''
    ]).join('; ');
    res.setHeader('content-security-policy', cspHeader);
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.render(dist ? 'index.html' : 'build/index.jade');
    return;
  } else if (req.url === '/landing.html') {
    res.render(dist ? 'landing.html' : 'build/landing.jade');
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
    res.redirect('wallet/');
  } else if (req.url === '/wallet') {
    res.redirect('wallet/');
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
  console.log('Visit http://localhost:%d/', port);
});

// Helper functions
function loadEnv (envFile) {
  try {
    require('node-env-file')(envFile);
  } catch (e) {
    console.log('You may optionally create a .env file to configure the server.');
  }
}
