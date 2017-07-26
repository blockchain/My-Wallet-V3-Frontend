
angular
  .module('walletDirectives')
  .directive('fiatOrEth', fiatOrEth);

fiatOrEth.$inject = ['Wallet', 'currency'];

function fiatOrEth (Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      eth: '='
    },
    templateUrl: 'templates/fiat-or-eth.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.settings = Wallet.settings;
    scope.currency = scope.settings.displayCurrency;

    scope.isBitCurrency = currency.isBitCurrency;

    scope.updateDisplay = () => {
      scope.currency = Wallet.settings.displayCurrency;
    };

    scope.$watch('settings.displayCurrency', scope.updateDisplay);
  }
}
