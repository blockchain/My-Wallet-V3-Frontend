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

      # Attempt to import restrictions from json attribute
      try
        restrict = angular.fromJson(attrs.restrict)
      catch error
        console.error 'Invalid JSON in "restrict" attribute'

      # Restriction imposing functions
      restrictions = {
        max: (input, max) ->
          if input > max then max else input

        decimals: (input, decimals) ->
          formatted = parseFloat(input.toFixed(decimals))
          if formatted != input then formatted else input

        negative: (input, negative) ->
          if !negative then Math.abs(input) else input
      }

      # View parser
      scope.parseToModel = (viewValue) ->
        modifiedInput = viewValue

        for key,modifier of restrictions
          break if modifiedInput == null
          if restrict[key] != undefined
            modifiedInput = modifier(modifiedInput, restrict[key])

        if modifiedInput != viewValue
          ctrl.$setViewValue(modifiedInput)
          ctrl.$render()

        return Wallet.convertToSatoshi(modifiedInput, scope.transformCurrency)

      # Model formatter
      scope.formatToView = (modelValue) ->
        return Wallet.convertFromSatoshi(modelValue, scope.transformCurrency)

      ctrl.$parsers.push scope.parseToModel
      ctrl.$formatters.push scope.formatToView
  }
)
