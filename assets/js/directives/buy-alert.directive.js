angular
  .module('walletApp')
  .directive('buyAlert', buyAlert);

buyAlert.$inject = ['$cookies'];

function buyAlert ($cookies) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/buy-alert.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.reveal = false;
    scope.dismissed = $cookies.get('buy-alert-seen');

    scope.dismissMessage = () => {
      scope.dismissed = true;
      scope.reveal = false;
      $cookies.put('buy-alert-seen', true);
    };

    scope.revealMsg = () =>
      scope.reveal = true;
  }
}
