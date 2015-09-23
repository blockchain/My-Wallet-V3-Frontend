angular.module('walletApp').directive('transformCurrency', (Wallet, Currency) ->
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

      # Restrictions, updated based on currency type
      restrictions = {
        max: Currency.convertFromSatoshi(21e14, scope.transformCurrency)
        decimals: Currency.decimalPlacesForCurrency(scope.transformCurrency)
        negative: false
      }

      # Modifiers for imposing restrictions on viewValue
      modifiers = {
        max: (input, max) ->
          if input > parseInt(max) then parseInt(max) else input

        decimals: (input, decimals) ->
          split = input.toString().split('.')
          if split[1]?
            split[1] = split[1].slice(0, decimals)
          return parseFloat(split.join('.'))

        negative: (input, allow) ->
          if allow then input else Math.abs(input)
      }

      # View parser
      scope.parseToModel = (viewValue) ->
        modifiedInput = viewValue

        for key,mod of modifiers
          break if modifiedInput == null
          modifiedInput = mod(modifiedInput, restrictions[key])

        if modifiedInput != viewValue
          ctrl.$setViewValue(modifiedInput)
          ctrl.$render()

        return Currency.convertToSatoshi(modifiedInput, scope.transformCurrency)

      # Model formatter
      scope.formatToView = (modelValue) ->
        fiat = Currency.convertFromSatoshi(modelValue, scope.transformCurrency)
        factor = Math.pow(10, restrictions.decimals)
        formatted = (Math.floor(fiat * factor) / factor)
          .toFixed(restrictions.decimals)
        parseFloat(formatted)

      ctrl.$parsers.push scope.parseToModel
      ctrl.$formatters.push scope.formatToView

  }
)
