angular
  .module('walletApp')
  .directive('siftScience', siftScience);

function siftScience ($sce, $rootScope, Options) {
  const directive = {
    restrict: 'E',
    scope: {
      userId: '=',
      tradeId: '='
    },
    template: `
      <iframe
        ng-if='enabled'
        ng-src='{{ url }}'
        sandbox='allow-same-origin allow-scripts'
        scrolling = 'no'
        id='sift-science-iframe'
      ></iframe>
    `,
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.enabled = true;

    if (!scope.userId) {
      console.error('sift-science(user-id) missing');
      return;
    }
    if (!scope.tradeId) {
      console.error('sift-science(trade-id) missing');
      return;
    }

    let processOptions = (options) => {
      let url = `http://localhost:8081/wallet-helper/sift-science/key/${$rootScope.sfoxSiftScienceKey || options.partners.sfox.siftScience}/user/${ scope.userId }/trade/${ scope.tradeId }`;
      scope.url = $sce.trustAsResourceUrl(url);

      if ($rootScope.buySellDebug) {
        console.info(url);
      }
    };

    if (Options.didFetch) {
      processOptions(Options.options);
    } else {
      Options.get().then(processOptions);
    }

    let receiveMessage = (e) => {
      if (!e.data.command) return;
      if (e.data.from !== 'sift-science') return;
      if (e.data.to !== 'exchange') return;
      if (e.origin !== 'http://localhost:8081') return;
      switch (e.data.command) {
        case 'done':
          // Remove Sift Science iframe:
          if ($rootScope.buySellDebug) {
            console.info('Dismiss Sift Science iframe');
          }
          scope.enabled = false;
          break;
        default:
          console.error('Unknown command');
          return;
      }

      $rootScope.$safeApply();
    };

    window.addEventListener('message', receiveMessage, false);
  }
}
