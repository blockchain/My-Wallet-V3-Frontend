
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
    scope.docIsReady = () => {
      $timeout(() => { scope.liftoff = true }, 0)
      $timeout(() => { scope.orbiting = true }, 1000)
      $timeout(() => { elem.remove() }, 2000)
    };

    angular.element(document).ready(scope.docIsReady)
  }
}