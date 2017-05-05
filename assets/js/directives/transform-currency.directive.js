
angular
  .module('walletDirectives')
  .directive('transformCurrency', transformCurrency);

function transformCurrency (Wallet, currency) {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      transformCurrency: '='
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    if (!ctrl ||
        scope.transformCurrency == null ||
        scope.transformCurrency.code == null
      ) return;

    // Restrictions, updated based on currency type
    const restrictions = {
      max: currency.convertFromSatoshi(21e14, scope.transformCurrency),
      decimals: currency.decimalPlacesForCurrency(scope.transformCurrency),
      negative: false
    };

    // Modifiers for imposing restrictions on viewValue
    const modifiers = {
      max: function (input, max) {
        return input > parseInt(max, 10) ? parseInt(max, 10) : input;
      },
      decimals: function (input, decimals) {
        let split = input.toString().split('.');
        if (split[1] != null) split[1] = split[1].slice(0, decimals);
        return parseFloat(split.join('.'));
      },
      negative: function (input, allow) {
        return allow ? input : Math.abs(input);
      }
    };

    // View parser
    scope.parseToModel = (viewValue) => {
      let modifiedInput = viewValue;

      for (let key in modifiers) {
        let mod = modifiers[key];
        if (modifiedInput === null) break;
        modifiedInput = mod(modifiedInput, restrictions[key]);
      }

      if (modifiedInput !== viewValue) {
        ctrl.$setViewValue(modifiedInput);
        ctrl.$render();
      }

      return currency.convertToSatoshi(modifiedInput, scope.transformCurrency);
    };

    // Model formatter
    scope.formatToView = (modelValue) => {
      if (modelValue === null || modelValue === '') return null;
      let fiat = currency.convertFromSatoshi(modelValue, scope.transformCurrency);
      let factor = Math.pow(10, restrictions.decimals);
      let formatted = (Math.floor(fiat * factor) / factor).toFixed(restrictions.decimals);
      return parseFloat(formatted);
    };

    ctrl.$parsers.push(scope.parseToModel);
    ctrl.$formatters.push(scope.formatToView);
  }
}
