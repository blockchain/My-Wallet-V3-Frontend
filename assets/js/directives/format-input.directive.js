angular
  .module('walletApp')
  .directive('formatInput', formatInput);

function formatInput () {
  return {
    restict: 'A',
    scope: false,
    require: 'ngModel',
    link
  };

  function link (scope, elem, attrs, ctrl) {
    let inputFormat = attrs.formatInput;
    let language = { digit: 'x' };
    let isDigit = (d) => (/^\d$/).test(d);

    let isValid = scope.isValid = (str) => {
      return str.replace(/\d/g, language.digit) === inputFormat;
    };

    let reformat = scope.reformat = (format, str) => {
      let [s, ...sRest] = str;
      let [f, ...fRest] = format;

      if (s == null || f == null) return '';

      if (f === language.digit) {
        return (isDigit(s) ? s : '') + reformat(fRest, sRest);
      } else {
        return f + reformat(fRest, (s === f) ? sRest : str);
      }
    };

    scope.formatToView = (modelValue) => {
      return modelValue && reformat(inputFormat, modelValue.toString()) || '';
    };

    scope.parseToModel = (viewValue) => {
      let reformatted = reformat(inputFormat, viewValue);
      ctrl.$setViewValue(reformatted);
      ctrl.$setValidity('format', isValid(reformatted));
      ctrl.$render();
      return reformatted;
    };

    ctrl.$parsers.push(scope.parseToModel);
    ctrl.$formatters.push(scope.formatToView);
  }
}
