walletApp.directive('fiat', (Wallet , $compile) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      btc: '=btc'
    }
    template: "<span>{{ fiat }}</span>"
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      scope.conversions = Wallet.conversions
      scope.$watchCollection "conversions", (newVal) ->
        updateFiat()
      scope.$watch "settings.currency", (newVal) ->
        updateFiat()
      scope.$watch "btc", (newVal) ->
        updateFiat()
        
      updateFiat = () ->
        (scope.fiat = ""; return) unless scope.btc?
        (scope.fiat = ""; return) unless scope.settings.currency?
        conversion = scope.conversions[scope.settings.currency.code]
        (scope.fiat = ""; return)  unless conversion? && conversion.conversion > 0
    
        
        scope.fiat = conversion.symbol + numeral(scope.btc).divide(conversion.conversion).format("0.00")      
        
  }
)