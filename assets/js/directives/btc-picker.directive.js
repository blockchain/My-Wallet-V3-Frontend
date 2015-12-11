
angular
  .module('walletApp')
  .directive('btcPicker', btcPicker);

btcPicker.$inject = ['$translate', 'Wallet', 'currency'];

function btcPicker($translate, Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      currency: '=',
      displayCurrency: '='
    },
    templateUrl: 'templates/btc-picker.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.currencies = currency.bitCurrencies;
    scope.didSelect = (item, model) => {
      scope.currency = item;
      if (currency.isBitCurrency(scope.displayCurrency)) {
        scope.displayCurrency = item;
      }
    };
  }
}
