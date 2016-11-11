angular
  .module('walletApp')
  .directive('buyAlert', buyAlert);

buyAlert.$inject = ['$cookies'];

function buyAlert ($cookies) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/buy-alert.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.reveal = false;
    scope.dismissed = $cookies.get('buy-alert');

    scope.dismissMessage = () => {
      scope.dismissed = true;
      scope.reveal = false;
      $cookies.put('buy-alert', true);
    };

    scope.revealMsg = () =>
      scope.reveal = true;
  }
}
