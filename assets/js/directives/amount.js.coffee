angular.module('walletApp').directive('amount', (Wallet, Currency) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '=transaction'
    }
    templateUrl: 'templates/amount.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings

      scope.isBitCurrency = Currency.isBitCurrency
      scope.toggle = Wallet.toggleDisplayCurrency

      scope.absolute = (value) -> Math.abs(value)

  }
)
