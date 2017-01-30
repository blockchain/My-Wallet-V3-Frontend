
angular
  .module('walletApp')
  .directive('blocketLoading', blocketLoading);

blocketLoading.$inject = ['$timeout', 'Wallet'];

function blocketLoading ($timeout, Wallet) {
  const directive = {
    restrict: 'E',
    scope: {
      loading: '&'
    },
    templateUrl: 'templates/blocket-loading.jade',
    link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.initialized = !scope.loading();

    scope.launch = () => {
      $timeout(() => scope.liftoff = true, 0);
      $timeout(() => scope.orbiting = true, 1000);
      $timeout(() => elem.remove(), 2000);
    };

    scope.$watch('loading()', (loading, wasLoading) => {
      if (!loading && wasLoading) scope.launch();
    });
  }
}
