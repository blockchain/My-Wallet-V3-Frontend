
angular
  .module('walletApp')
  .directive('publicHeader', publicHeader);

function publicHeader() {
  const directive = {
    restrict: "E",
    replace: true,
    templateUrl: 'templates/public-header.jade',
    scope: {},
    link: function() {}
  };
  return directive;
}
