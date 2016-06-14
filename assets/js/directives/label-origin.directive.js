angular
  .module('walletApp')
  .directive('labelOrigin', labelOrigin);

function labelOrigin (Wallet, currency) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/label-origin.jade',
    scope: {
      origin: '=',
      fee: '=',
      highlight: '=',
      selected: '@'
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.settings = Wallet.settings;
    scope.isBitCurrency = currency.isBitCurrency;
    scope.isSelected = attrs['selected'] !== undefined;

    scope.determineAvailableBalance = (balance) => {
      if (balance == null) return;

      let finalBalance = parseInt(balance, 10);
      if (scope.fee) finalBalance -= parseInt(scope.fee, 10);

      return finalBalance < 0 ? 0 : finalBalance;
    };

    scope.determineLabel = (origin) => {
      if (origin == null) return;
      return origin.label || origin.address;
    };
  }
}
