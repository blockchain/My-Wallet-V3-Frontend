
angular
  .module('walletDirectives')
  .directive('uiLadda', uiLadda);

function uiLadda () {
  const directive = {
    restrict: 'A',
    replace: false,
    scope: {
      laddaTranslate: '@',
      uiLadda: '=',
      disabled: '=ngDisabled'
    },
    templateUrl: 'templates/ui-ladda.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    elem.addClass('ladda-button');
    elem.removeAttr('ng-click');

    let setAttr = (attr, enabled) => {
      enabled ? elem.attr(attr, true) : elem.removeAttr(attr);
    };

    scope.$watchGroup(['uiLadda', 'disabled'], () => {
      setAttr('data-loading', scope.uiLadda);
      setAttr('disabled', scope.uiLadda || scope.disabled);
    });
  }
}
