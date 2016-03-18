
angular
  .module('walletApp')
  .directive('blocketLoading', blocketLoading);

blocketLoading.$inject = ['$timeout', 'Wallet'];

function blocketLoading($timeout, Wallet) {
  const directive = {
    restrict: 'E',
    scope: {},
    templateUrl: 'templates/blocket-loading.jade',
    link: link
  }

  return directive;

  function link(scope, elem, attrs) {
    scope.initialized = Wallet.status.isLoggedIn && Wallet.status.didLoadSettings && Wallet.status.didLoadTransactions;

    scope.docIsReady = () => {
      $timeout(() => { scope.liftoff = true }, 0)
      $timeout(() => { scope.orbiting = true }, 1000)
      $timeout(() => { elem.remove() }, 2000)
    };

    angular.element(document).ready(scope.docIsReady)
  }
}