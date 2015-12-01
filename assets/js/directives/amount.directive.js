
angular
  .module('walletApp')
  .directive('amount', amount);

amount.$inject = ['Wallet'];

function amount(Wallet) {
  const directive = {
    restrict: 'E',
    replace: 'false',
    scope: {
      transaction: '=transaction'
    },
    templateUrl: 'templates/amount.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.settings = Wallet.settings;
    scope.isBitCurrency = Wallet.isBitCurrency;
    scope.toggle = Wallet.toggleDisplayCurrency;
    scope.absolute = (value) => Math.abs(value);
  }
}
