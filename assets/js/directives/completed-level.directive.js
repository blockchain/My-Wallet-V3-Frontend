
angular
  .module('walletApp')
  .directive('completedLevel', completedLevel);

completedLevel.$inject = [];

function completedLevel () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      img: '@',
      message: '@',
      placement: '@'
    },
    templateUrl: 'templates/completed-level.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.tooltip = {
      templateUrl: 'templates/completed-level-tooltip.jade',
      placement: scope.placement || 'top'
    };
  }
}
