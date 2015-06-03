walletApp.directive('amount', (Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '=transaction'
    }
    templateUrl: 'templates/amount.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings

      scope.isBitCurrency = Wallet.isBitCurrency
      scope.toggle = Wallet.toggleDisplayCurrency

  }
)