angular
  .module('walletApp')
  .directive('siftScience', siftScience);

function siftScience ($sce, $rootScope) {
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
    scope.url = $sce.trustAsResourceUrl(`http://localhost:8081/helper-app/sift-science/#/key/3884e5fae5/user/${ scope.userId }/trade/${ scope.tradeId }`);

    let receiveMessage = (e) => {
      if (!e.data.command) return;
      if (e.data.from !== 'sift-science') return;
      if (e.data.to !== 'exchange') return;
      if (e.origin !== 'http://localhost:8081') return;
      switch (e.data.command) {
        case 'done':
          // Remove Sift Science iframe:
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
