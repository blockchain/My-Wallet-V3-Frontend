
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
      values: '=',
      url: '@',
      placement: '@',
      link: '@',
      linktext: '@',
      append: '@'
    },
    templateUrl: 'templates/helper-button.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.warning = attrs.warning != null;

    scope.helperText = {
      templateUrl: 'templates/helper-popover.pug',
      placement: scope.placement || 'top'
    };
  }
}
