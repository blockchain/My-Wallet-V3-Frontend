walletApp.directive('fiatOrBtc', (Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      btc: '=btc'
    }
    templateUrl: 'templates/fiat-or-btc.jade'
    link: (scope, elem, attrs) ->           
      scope.settings = Wallet.settings 
  }
)