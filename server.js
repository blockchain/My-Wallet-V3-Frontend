'use strict';

var express         = require('express')
  , compression     = require('compression')
  , errorhandler    = require('errorhandler')
  , ejs             = require('ejs')
  , request         = require('request')
  , path            = require('path')

loadEnv('.env');

var port      = process.env.PORT || 8080
  , dist      = parseInt(process.env.DIST) === 1
  , origins   = (process.env.BLOCKCHAIN || '').split(' ')
  , whitelist = (process.env.IP_WHITELIST || '').split(' ')

// App configuration
var app = express();

app.use(compression({
  threshold: 512
}));

app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));

app.use(function (req, res, next) {
  if (req.url === '/') {
    var cspHeader = ([
      "img-src 'self' blockchain.info data:",
      "style-src 'self' 'sha256-vv5i1tRAGZ/gOQeRpI3CEWtvnCpu5FCixlD2ZPu7h84=' 'sha256-47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU='",
      "child-src 'none'",
      "script-src 'self' 'sha256-mBeSvdVuQxRa2pGoL8lzKX14b2vKgssqQoW36iRlU9g=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
      "connect-src 'self' *.blockchain.info *.blockchain.com wss://*.blockchain.info https://blockchain.info https://api.sharedcoin.com",
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

app.get('/verify-email', function (req, res) {
  request.get('https://blockchain.info/wallet' + req.originalUrl);
  res.cookie('email-verified', true);
  res.redirect('/');
});

app.get('/authorize-approve', function (req, res) {
  var approveHTML = '\
    <!doctype html>\n\
    <html>\n\
      <head>\n\
      <meta charset="utf-8">\n\
      <title>Verifying authorization request</title>\n\
        <script>\n\
          var xmlHttp = new XMLHttpRequest();\n\
          // The redirect should be done in the callback, but currently the callback doesn\'t get called because the authorize-approve page makes an ajax request to /wallet over http which is blocked\n\
          // xmlHttp.onload = function () {\n\
          //   window.location.replace("/");\n\
          // };\n\
          xmlHttp.open("GET", "https://blockchain.info/wallet' + req.originalUrl + '", true);\n\
          xmlHttp.send();\n\
          setTimeout(function() { window.location.replace("/"); }, 500);\n\
        </script>\n\
      </head>\n\
    </html>';
  res.send(approveHTML);
});

app.get('/unsubscribe', function (req, res) {
  request.get('https://blockchain.info/wallet' + req.originalUrl);
  res.redirect('/');
});

app.get(/^\/.{8}-.{4}-.{4}-.{4}-.{12}$/, function (req, res) {
  res.cookie('uid', '"' + req.path.split(path.sep)[1] + '"');
  res.redirect('/');
});

app.use(function (req, res) {
  res.send('<center><h1>404 Not Found</h1></center>');
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
