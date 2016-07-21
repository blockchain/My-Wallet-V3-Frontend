angular
  .module('walletApp')
  .directive('isignthis', isignthis);

function isignthis ($sce) {
  const directive = {
    restrict: 'E',
    scope: {
      onLoad: '&',
      onDecline: '&',
      onSuccess: '&',
      paymentInfo: '=',
      transactionId: '='
    },
    template: `
      <iframe
        ng-src='{{ url }}'
        sandbox='allow-same-origin allow-scripts allow-forms'
        scrolling = 'no'
        id='isx-iframe'
        ng-if='showFrame'
      ></iframe>
    `,
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.$watch('transactionId', (newValue) => {
      if (newValue) {
        scope.iSignThisFrame(newValue);
      }
    });

    scope.iSignThisFrame = (iSignThisID) => {
      // TODO: use elem or avoid usage alltogether:
      var e = document.getElementById('isx-iframe');

      scope.url = $sce.trustAsResourceUrl('https://verify.isignthis.com/landing/' + iSignThisID + '?embed=true');

      // iSignThis iframe contoller code, TODO:
      // * Angularize

      // Script loaded by demo
      var _isx = {
        transactionId: '',
        version: '1.0.0',
        configOptions: null
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

      scope.showFrame = true;

      _isx
        .setup(widget)
        .done(function (e) {
          console.log('completed. e=', JSON.stringify(e));
          scope.showFrame = false;
        })
        .fail(function (e) {
          console.log('error. e=' + JSON.stringify(e));
        })
        .route(function (e) {
          console.log('route. e=' + JSON.stringify(e));
          scope.paymentInfo = e.route.match('/otp|/secret|/verify-pin');
          switch (e.state) {
            case 'PENDING':
              if (scope.loaded) return;
              scope.loaded = true;
              scope.onLoad();
              break;
            case 'SUCCESS':
              scope.onSuccess();
              break;
            case 'DECLINED':
              if (scope.declined) return;
              scope.declined = true;
              scope.onDecline();
              break;
            case 'REJECTED':
              if (scope.declined) return;
              scope.declined = true;
              scope.onDecline();
              break;
            case 'FAILED':
              if (scope.declined) return;
              scope.declined = true;
              scope.onDecline();
              break;
          }
        })
        .publish();
    };
  }
}
