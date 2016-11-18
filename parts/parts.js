var express = require('express');

String.prototype.toCamelCase = function () { // eslint-disable-line no-extend-native
  return this.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

function app (rootURL, webSocketURL, apiDomain) {
  var app = express();

  app.use(function (req, res, next) {
    var isDirective = req.url.match(/\/directives\/([A-Za-z\-]+)\/$/);
    var isAsset = req.url.match(/(\/(?:img|locales)\/.*)/);

    if (isDirective) {
      var directive = isDirective[1];
      var directiveCamel = directive.toCamelCase();
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
      var jade = require('jade');
      res.render('index.jade', {
        directive: directive,
        directiveCamel: directiveCamel,
        templateRender: jade.renderFile
      });
      return;
    }

    if (isAsset) {
      res.redirect('/wallet/build' + isAsset[1]);
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
