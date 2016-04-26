
angular
  .module('walletApp')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope'];

function publicHeader ($rootScope) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/public-header.jade',
    scope: {},
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.rootURL = $rootScope.rootURL;
  }
}
