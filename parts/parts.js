var express = require('express');

function app (rootURL, webSocketURL, apiDomain) {
  var app = express();

  app.use(function (req, res, next) {
    if (req.url.match(/\/directives\/[A-Za-z]+\/$/)) {
      var cspHeader = ([
        "img-src 'self' data: blob:",
        "style-src 'self'",
        'child-src none',
        "script-src 'self' ",
        'connect-src ' + [
          "'self'",
          rootURL,
          (webSocketURL || 'wss://ws.blockchain.info'),
          (apiDomain || 'https://api.blockchain.info'),
          'https://app-api.coinify.com'
        ].join(' '),
        "object-src 'none'",
        "media-src 'self' https://storage.googleapis.com/bc_public_assets/ data: mediastream: blob:",
        "font-src 'self'", ''
      ]).join('; ');
      res.setHeader('content-security-policy', cspHeader);
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      // TODO: get controller name, etc
      res.render('index.jade');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
    next();
  });

  app.set('view engine', 'jade');
  app.set('views', __dirname);
  app.use(express.static(__dirname));

  app.use(function (req, res) {
    res.status(404).send('<center><h1>404 Not Found</h1></center>');
  });

  return app;
}

module.exports = {
  app: app
};
