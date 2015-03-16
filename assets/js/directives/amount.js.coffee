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
      scope.showBTC = () -> attrs.btc? || scope.settings.displayCurrency.code == "BTC" # May not work correctly within ng-repeat
      scope.showMBTC = () -> scope.settings.displayCurrency.code == "mBTC"
      
      scope.toggle = () ->
        if scope.settings.displayCurrency.code == "BTC"
          scope.settings.displayCurrency = {code: "mBTC"}
        else if scope.settings.displayCurrency.code == "mBTC"
          scope.settings.displayCurrency = scope.settings.currency
        else
          scope.settings.displayCurrency = {code: "BTC"}
  }
)