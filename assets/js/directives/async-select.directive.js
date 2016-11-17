
angular
  .module('walletDirectives')
  .directive('asyncSelect', asyncSelect);

function asyncSelect ($translate, Alerts) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      selected: '=',
      range: '=',
      displayProp: '@',
      displayOptional: '@',
      onChange: '='
    },
    templateUrl: 'templates/async-select.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.didSelect = (item) => {
      scope.changing = true;
      scope.onChange(item)
        .then(() => scope.selected = item)
        .catch(() => {
          let err = $translate.instant('SETTING_SELECT_ERR', { setting: scope.displayItem(item) });
          Alerts.displayError(err);
        })
        .finally(() => scope.changing = false);
    };

    scope.displayItem = (item, showOptionalProp) => {
      if (!item) return '';
      let text = item[scope.displayProp];
      if (scope.displayOptional && showOptionalProp) {
        text += ` (${item[scope.displayOptional]})`;
      }
      return text;
    };
  }
}
