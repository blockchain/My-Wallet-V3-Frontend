angular
  .module('walletApp')
  .directive('labelOrigin', labelOrigin);

function labelOrigin(Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/label-origin.jade',
    scope: {
      origin: '=',
      fee: '=',
      highlight: '='
    },
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.settings = Wallet.settings;
    scope.isBitCurrency = currency.isBitCurrency;

    scope.determineAvailableBalance = (balance) => {
      if (balance == null) return;

      finalBalance = parseInt(balance);
      if (scope.fee) finalBalance -= parseInt(scope.fee);

      return finalBalance < 0 ? 0 : finalBalance;
    };

    scope.determineLabel = (origin) => {
      if (origin == null) return;
      return origin.label || origin.address;
    };

  }
}
