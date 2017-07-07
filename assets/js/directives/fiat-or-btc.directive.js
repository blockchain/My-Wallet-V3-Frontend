
angular
  .module('walletDirectives')
  .directive('fiatOrBtc', fiatOrBtc);

fiatOrBtc.$inject = ['Wallet', 'currency'];

function fiatOrBtc (Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      btc: '=',
      eth: '='
    },
    templateUrl: 'templates/fiat-or-btc.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.settings = Wallet.settings;
    scope.currency = scope.settings.displayCurrency;
    scope.isBitCurrency = currency.isBitCurrency;
    scope.isEthCurrency = currency.isEthCurrency;

    scope.updateDisplay = () => {
      scope.currency = Wallet.settings.displayCurrency;
    };

    scope.$watch('settings.displayCurrency', scope.updateDisplay);
  }
}
