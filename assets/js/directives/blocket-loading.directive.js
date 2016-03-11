
angular
  .module('walletApp')
  .directive('blocketLoading', blocketLoading);

blocketLoading.$inject = ['$rootScope', '$timeout'];

function blocketLoading($rootScope, $timeout) {
  const directive = {
    restrict: 'E',
    scope: {},
    templateUrl: 'templates/blocket-loading.jade',
    link: link
  }

  return directive;

  function link(scope, elem, attrs) {
    $timeout(() => {
      scope.timeout = true;
      scope.windowLoading = true; 
    }, 500)

    scope.docIsReady = () => {
      if (!scope.timeout) { scope.hide=true; return; }

      $timeout(() => { scope.liftoff = true }, 0)
      $timeout(() => { scope.orbiting = true }, 1000)
      $timeout(() => { scope.windowLoading = false }, 1000)
    };

    angular.element(document).ready(scope.docIsReady)
  }
}