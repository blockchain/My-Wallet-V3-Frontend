'use strict';

var express         = require('express')
  , compression     = require('compression')
  , bodyParser      = require('body-parser')
  , morgan          = require('morgan')
  , errorhandler    = require('errorhandler')
  , methodOverride  = require('method-override')
  , ejs             = require('ejs')
  , auth            = require('basic-auth')
  , request         = require('request')
  , path            = require('path')
  , fs              = require('fs');

loadEnv('.env');

var port      = process.env.PORT || 8080
  , dist      = parseInt(process.env.DIST) === 1
  , beta      = parseInt(process.env.BETA) === 1
  , origins   = (process.env.BLOCKCHAIN || '').split(' ')
  , whitelist = (process.env.IP_WHITELIST || '').split(' ')
  , admin     = { user: 'blockchain', pass: process.env.ADMIN_PASSWORD };

// App configuration
var app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
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
    } else if (dist && beta) {
      res.render('index-beta.html');
    } else if (dist) {
      res.render('index.html');
    } else {
      res.render('app/index.jade');
    }
    return;

  }
  if (req.url.indexOf('beta_key')) {
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache');
  } else if (dist) {
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
  app.use(methodOverride());
  app.use(express.static(__dirname));
  app.set('view engine', 'jade');
  app.set('views', __dirname);
}

// Routing
if (beta) {
  // Beta system enabled
  console.log('Enabling beta invite system');
  var v3Beta = require('my-wallet-v3-beta-module')(path.join(__dirname, process.env.BETA_DATABASE_PATH || ''));

  app.get(/^\/key-.{8}$/, function (req, res) {
    var key = req.path.split(path.sep)[1].split('-')[1];
    v3Beta.emailLinkFollowed({key:key});
    res.cookie('key', '"' + key + '"');
    res.redirect('/');
  });

  // *.blockchain.info/logo-key-{key} redirects to image on Amazon
  app.get(/^\/key-logo-.{8}$/, function (req, res) {
    var key = req.path.split(path.sep)[1].split('-')[2];
    v3Beta.emailOpened({key:key});
    res.redirect('https://s3.amazonaws.com/blockchainwallet/bc-logo-family.png');
  });

  app.post('/check_beta', function (req, res) {
    v3Beta.verifyLimit(function (err, open) {
      if (err) res.json({ open: false, error: {message: err} });
      else res.json({ open: open });
    });
  });

  app.post('/verify_wallet_created', function (req, res) {
    v3Beta.verifyLimit(function (err, open) {
      if (err) res.json({ success: false, error: {message: err} });
      else res.json({ success: open });
    });
  });

  app.post('/check_guid_for_beta_key', function (req, res) {
    v3Beta.isGuidAssociatedWithBetaKey(req.body.guid, function (err, verified) {
      if (err) {
        res.json({
          verified: false,
          error: {
            message: 'There was a problem verifying your invite key. Please try again later.',
            err: err
          }
        });
      } else if (verified) {
        res.json({ verified: true });
      } else {
        res.json({
          verified: false,
          error: { message: 'Please create a new Alpha wallet first.' }
        });
      }
    });
  });

  app.post('/register_guid', function (req, res) {
    v3Beta.verifyLimit(function (err, open) {
      if (err) {
        res.json({ success: false, error: {message: err} });
      } else {
        v3Beta.assignKey('', req.body.email, req.body.guid, function (key) {
          v3Beta.newWalletCreated(key, function () {
            res.json({ success: true });
          });
        });
      }
    });
  });

  app.post('/whitelist_guid', function (req, res) {
    if (req.body == null) {
      res.json({ error: 'no request body' });
    } else if (req.body.secret !== process.env.WHITELIST_SECRET) {
      res.json({ error: 'incorrect secret' });
    } else if (req.body.guid == null) {
      res.json({ error: 'missing request body guid parameter' });
    } else {
      var name = req.body.name || 'Mobile Tester';
      v3Beta.assignKey(name, req.body.email, req.body.guid, function (err, key) {
        res.json({
          error: err,
          key: key
        });
      });
    }
  });

  app.get('/admin/?', authenticate(admin), function (req, res) {
    var adminIndex = dist ? 'admin.html' : 'app/admin.jade';
    res.render(adminIndex);
  });

  app.get("/admin/api/:method", authenticate(admin), function (req, res) {
    switch (req.params.method) {
      case 'get-all-keys':
        v3Beta.getKeys(function (err, data) {
          res.send(JSON.stringify(data));
        });
        break;
      case 'get-sorted-keys':
        v3Beta.getKeys(req.query, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'assign-key':
        v3Beta.assignKey(req.query.name, req.query.email, req.query.guid, function (err, key) {
          res.json({
            error: err,
            key: key
          });
        });
        break;
      case 'delete-key':
        v3Beta.deleteKey(req.query, function (err) {
          res.json({ error: err });
        });
        break;
      case 'update-key':
        v3Beta.updateKey(req.query.selection, req.query.update, function (err) {
          res.json({ error: err });
        });
        break;
      case 'activate-key':
        v3Beta.activateKey(req.query.selection, req.query.update, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'remind-email':
        v3Beta.remindEmail(req.query.key, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'activate-all':
        var range = [req.query.min || 0, req.query.max || 100000];
        v3Beta.activateAll(range, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'remind-all':
        var range = [req.query.min || 0, req.query.max || 100000];
        v3Beta.remindAll(range, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'resend-activation':
        v3Beta.resendActivationEmail(req.query.key, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'resend-many':
        var range = [req.query.min || 0, req.query.max || 100000];
        v3Beta.resendMany(range, function (err, data) {
          res.json({
            error: err,
            data: data
          });
        });
        break;
      case 'wallets-created':
        v3Beta.fetchNumWalletsCreated(function (err, count) {
          res.json({
            error: err,
            count: count
          });
        });
        break;
      case 'get-csv':
        v3Beta.fetchCSV({}, function (err, csv) {
          fs.writeFileSync('tmp.csv', csv);
          res.download('tmp.csv', 'emails.csv', function () {
            fs.unlink('tmp.csv');
          });
        });
        break;
      case 'set-percent-requested':
        var percent   = parseInt(req.query.percent)
          , isNumber  = !isNaN(percent);
        if (isNumber) process.env.PERCENT_REQUESTED = percent;
        res.json({
          success: Boolean(isNumber)
        });
        break;
      default:
        res.status(400).json({
          error: { message: 'Unknown request method' },
          success: false
        });
    }
  });
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

app.post('/feedback', function (req, res) {
  var jira    = 'https://blockchain.atlassian.net/rest/collectors/1.0/template/feedback/e6ce4d72'
    , headers = { 'X-Atlassian-Token': 'nocheck' };
  request.post({
    url: jira,
    headers: headers,
    form: req.body
  }, function (err, httpResponse, body) {
    res.json({ success: !(err != null) });
  });
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

function authenticate(options) {
  return function (req, res, next) {
    var credentials = auth(req)
      , authorized  = credentials &&
                      credentials.name === options.user &&
                      credentials.pass === options.pass;
    authorized ? next() : issueChallenge();
    function issueChallenge() {
      res.setHeader('WWW-Authenticate', 'Basic realm="blockchain-wallet-v3"');
      res.sendStatus(401);
    }
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
