angular.module('walletApp').directive('labelOrigin', (Wallet, Currency) ->
  {
    restrict: "E"
    replace: true
    templateUrl: 'templates/label-origin.jade'
    scope: {
      origin: '='
      fee: '='
      highlight: '='
    }
    link: (scope, elem, attrs) ->

      scope.settings = Wallet.settings
      scope.isBitCurrency = Currency.isBitCurrency

      scope.determineAvailableBalance = (balance) ->
        return unless balance?
        final = parseInt(balance)
        if scope.fee
          final -= parseInt(scope.fee)
        return if final < 0 then 0 else final

      scope.determineLabel = (origin) ->
        return unless origin?
        origin.label || origin.address

  }
)
