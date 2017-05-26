angular
  .module('walletDirectives')
  .directive('siftScience', siftScience);

function siftScience ($sce, Env, AngularHelper, $window) {
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

    let processEnv = (env) => {
      let url = `${env.walletHelperDomain}/wallet-helper/sift-science/#/key/${env.sfoxSiftScienceKey || env.partners.sfox.siftScience}/user/${ scope.userId }/trade/${ scope.tradeId }`;
      scope.url = $sce.trustAsResourceUrl(url);

      if (env.buySellDebug) {
        console.info(url);
      }
    };

    Env.then().then(processEnv);

    Env.then(env => {
      let receiveMessage = (e) => {
        if (!e.data.command) return;
        if (e.data.from !== 'sift-science') return;
        if (e.data.to !== 'exchange') return;
        if (e.origin !== env.walletHelperDomain) return;
        switch (e.data.command) {
          case 'done':
            // Remove Sift Science iframe:
            if (env.buySellDebug) {
              console.info('Dismiss Sift Science iframe');
            }
            scope.enabled = false;
            break;
          default:
            console.error('Unknown command');
            return;
        }

        AngularHelper.$safeApply();
      };

      $window.addEventListener('message', receiveMessage, false);
    });
  }
}
