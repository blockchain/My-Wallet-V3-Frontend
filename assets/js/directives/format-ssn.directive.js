angular
  .module('walletApp')
  .directive('formatSsn', formatSsn);

function formatSsn () {
  return {
    restict: 'A',
    scope: false,
    require: 'ngModel',
    link
  };

  function link (scope, elem, attrs, ctrl) {
    let isSSN = (ssn) => (/^\d{3}-\d{3}-\d{4}$/).test(ssn);

    let format = (str) => ([
      str.slice(0, 3),
      str.slice(3, 6),
      str.slice(6, 10)
    ]).filter(x => x).join('-');

    let parse = (str) => (
      str.replace(/-|[^0-9]/g, '')
    );

    scope.formatToView = (modelValue) => {
      return modelValue != null && format(modelValue.toString()) || '';
    };

    scope.parseToModel = (viewValue) => {
      let reformatted = format(parse(viewValue));
      ctrl.$setViewValue(reformatted);
      ctrl.$setValidity('ssn', isSSN(reformatted));
      ctrl.$render();
      return reformatted;
    };

    ctrl.$parsers.push(scope.parseToModel);
    ctrl.$formatters.push(scope.formatToView);
  }
}
