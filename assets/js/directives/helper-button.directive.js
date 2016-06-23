
angular
  .module('walletApp')
  .directive('helperButton', helperButton);

helperButton.$inject = ['$translate'];

function helperButton ($translate) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      url: '@',
      placement: '@',
      link: '@',
      linktext: '@',
      append: '@'
    },
    templateUrl: 'templates/helper-button.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.warning = attrs.warning != null;

    scope.helperText = {
      templateUrl: 'templates/helper-popover.jade',
      placement: scope.placement || 'top'
    };
  }
}
