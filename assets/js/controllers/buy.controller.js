angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet) {
  $scope.settings = Wallet.settings;

  $scope.quote = null;

  MyWallet.wallet.external.coinify.getQuote(25).then((quote) => {
    $scope.quote = quote;
  });

  $scope.buy = () => {
    MyWallet.wallet.external.coinify.buy(25).then((trade) => {
      $scope.trade = trade;
      $scope.iSignThisFrame(trade.iSignThisID);
    });
  };

  $scope.iSignThisFrame = (iSignThisID) => {
    // iSignThis iframe contoller code, TODO:
    // * Angularize
    // * handle iframe construction in jade file
    // * move to directive

    // Script loaded by demo
    var _isx = {
      transactionId: '',
      version: '1.0.0',
      configOptions: null
    };

    _isx.applyIframeStyles = function (i) {
      i.scrolling = 'no';
      i.sandbox = 'allow-same-origin allow-scripts allow-forms';
      i.style.width = '100%';
      i.style.height = '100%';
      i.style['border-width'] = '0';
      i.style.overflow = 'hidden';
    };

    _isx.applyContainerStyles = function (c) {
      c.style['width'] = '100%';
      if (this.configOptions.height) {
        c.style['height'] = this.configOptions.height;
      } else {
        c.style['height'] = '700px';
      }
      c.style['overflow'] = 'hidden';
    };

    _isx.setup = function (setup) {
      this.transactionId = setup.transaction_id;

      this.configOptions = setup;

      return this;
    };

    _isx.done = function (_completeListener) {
      this.completeListener = _completeListener;
      return this;
    };

    _isx.fail = function (_errorListener) {
      this.errorListener = _errorListener;

      return this;
    };

    _isx.route = function (_routeListener) {
      this.routeListener = _routeListener;
      return this;
    };

    _isx.publish = function () {
      var _urlBase = '#url.base#';

      var landingUrl = 'https://verify.isignthis.com/' + 'landing';

      if (this.transactionId && this.transactionId.length > 0) {
        landingUrl += '/' + this.transactionId;
      }

      landingUrl = landingUrl + '?embed=true';

      this.container = document.getElementById('isx-container');

      if (!this.container) {
        // unable to find container
        var errorMsg = {
          error_code: 'invalid-container',
          transaction_id: this.transactionId
        };

        if (this.errorListener) {
          this.errorListener(errorMsg);
        }

        // just return straight away, we can't do anything
        return;
      }

      // apply container styles
      this.applyContainerStyles(this.container);

      var e = document.createElement('iframe');
      e.src = landingUrl;
      e.id = 'isx-iframe';

      e.src = landingUrl;
      var appliedIframeStyles = this.applyIframeStyles(e);
      if (appliedIframeStyles && this.container) {
        this.container.appendChild(e);
      } else {
        var container = document.getElementById('isx-container');
        if (!container) throw new Error('Unable to find valid container for iframe.');
        container.appendChild(e);
      }

      this.iframe = e;

      // Create IE + others compatible event handler
      var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

      var self = this;

      // Listen to message from child window
      eventer(messageEvent, function (e) {
        // Check for the domain who sent the messageEvent
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== 'https://verify.isignthis.com') {
          // Event not generated from ISX, simply return
          return;
        }

        var frame = document.getElementById('isx-iframe');
        if (e.source !== frame.contentWindow) {
          // Source of message isn't from the iframe
          return;
        }

        try {
          var d = JSON.parse(e.data);

          if (d.event.toLowerCase() === 'complete') {
            if (self.completeListener) {
              self.completeListener(d);
            }
          } else if (d.event.toLowerCase() === 'route') {
            if (self.routeListener) {
              self.routeListener(d);
            }
          } else if (d.event.toLowerCase() === 'error') {
            if (self.errorListener) {
              self.errorListener(d);
            }
          }
        } catch (err) {
          console.log('err caught:', err);
        }
      }, false);

      return this;
    };

    // window.isignthis = _isx;

    // Inline Javascript from demo:
    var widget = {
      transaction_id: iSignThisID,
      height: '680px'
    };

    $scope.showFrame = true;

    _isx
      .setup(widget)
      .done(function (e) {
        console.log('completed. e=', JSON.stringify(e));
        $scope.showFrame = false;
      })
      .fail(function (e) {
        console.log('error. e=' + JSON.stringify(e));
      })
      .route(function (e) {
        console.log('route. e=' + JSON.stringify(e));
      })
      .publish();
  };
}
