angular
  .module('walletApp')
  .directive('uiSelectOpen', uiSelectOpen);

function uiSelectOpen ($timeout) {
  return {
    restrict: 'A',
    require: 'uiSelect',
    link: function (scope, element, attrs, uiSelect) {
      scope.$watch(
        () => scope.$eval(attrs.uiSelectOpen),
        (open) => $timeout(() => uiSelect.open = open, 50));
      scope.$watch(
        () => uiSelect.open,
        (open) => !open && $timeout(() => scope.$eval(attrs.uiSelectOnClose), 50));
    }
  };
}
