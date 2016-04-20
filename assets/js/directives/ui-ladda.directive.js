
angular
  .module('walletApp')
  .directive('uiLadda', uiLadda);

function uiLadda() {
  const directive = {
    restrict: 'A',
    replace: false,
    scope: {
      laddaTranslate: '@',
      laddaValues: '=',
      uiLadda: '=',
      disabled: '=ngDisabled'
    },
    templateUrl: 'templates/ui-ladda.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    elem.addClass('ladda-button');
    elem.removeAttr('ng-click');

    scope.$watch('uiLadda + disabled', (newVal) => {
      if (scope.uiLadda) {
        elem.attr('data-loading', true);
        elem.attr('disabled', true);
      } else {
        elem.removeAttr('data-loading');
        if (!scope.disabled) elem.removeAttr('disabled');
      }
    });
  }
}
