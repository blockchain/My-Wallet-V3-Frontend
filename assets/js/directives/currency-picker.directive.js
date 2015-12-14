
angular
  .module('walletApp')
  .directive('currencyPicker', currencyPicker);

currencyPicker.$inject = ['currency'];

function currencyPicker(currency) {
  const directive = {
    restrict: "E",
    replace: 'false',
    scope: {
      currency: '=',
      displayCurrency: '='
    },
    templateUrl: 'templates/currency-picker.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.currencies = currency.currencies;
    scope.didSelect = (item, model) => {
      scope.currency = item;
      if (!currency.isBitCurrency(scope.displayCurrency)) {
        scope.displayCurrency = item;
      }
    };
  }
}
