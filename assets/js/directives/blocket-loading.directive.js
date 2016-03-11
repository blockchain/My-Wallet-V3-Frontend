
angular
  .module('walletApp')
  .directive('blocketLoading', blocketLoading);

blocketLoading.$inject = ['$rootScope', '$timeout'];

function blocketLoading($rootScope, $timeout) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/blocket-loading.jade',
    link: link
  }

  return directive;

  function link(scope, elem, attrs) {
    // give it a sec
    $timeout(() => {
      scope.loading = true; 
      scope.waiting = true;
    }, 500)

    // doc is ready, time for liftoff
    scope.docIsReady = () => {
      // if wait was not long enough just hide
      if (!scope.waiting) {scope.hide = true; return;}

      scope.liftoff = true
      $timeout(() => { scope.orbit = true }, 1000)
      $timeout(() => { scope.loading = false }, 1000)
    };

    angular.element(document).ready(scope.docIsReady)
  }
}