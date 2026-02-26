
angular
  .module('walletDirectives')
  .directive('fiatOrBch', fiatOrBch);

fiatOrBch.$inject = ['Wallet', 'currency'];

function fiatOrBch (Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      bch: '='
    },
    templateUrl: 'templates/fiat-or-bch.pug',
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
