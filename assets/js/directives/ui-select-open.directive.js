angular
  .module('walletApp')
  .directive('uiSelectOpen', uiSelectOpen);

function uiSelectOpen ($timeout) {
  return {
    restrict: 'A',
    require: 'uiSelect',
    link: function (scope, element, attrs, uiSelect) {
      // Allows programmatically opening/closing ui-select
      scope.$watch(
        () => scope.$eval(attrs.uiSelectOpen),
        (open) => $timeout(() => uiSelect.open = open, 50));

      // Adds a uiSelectOnClose listener, there is no onClose in the uiSelect API
      scope.$watch(
        () => uiSelect.open,
        (open) => !open && $timeout(() => scope.$eval(attrs.uiSelectOnClose), 50));
    }
  };
}
