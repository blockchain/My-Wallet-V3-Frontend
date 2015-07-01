walletApp.directive('transformCurrency', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      transformCurrency: '='
    }
    link: (scope, elem, attrs, ctrl) ->
      return unless ctrl
      return unless scope.transformCurrency?
      return unless scope.transformCurrency.code?

      scope.parseToModel = (viewValue) ->
        return Wallet.convertToSatoshi(viewValue, scope.transformCurrency)

      scope.formatToView = (modelValue) ->
        return Wallet.convertFromSatoshi(modelValue, scope.transformCurrency)

      ctrl.$parsers.push scope.parseToModel
      ctrl.$formatters.push scope.formatToView
  }
)
