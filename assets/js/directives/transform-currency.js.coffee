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

      # Restrictions, updated based on currency type
      restrictions = {
        max: Wallet.convertFromSatoshi(21e14, scope.transformCurrency)
        decimals: ((c) ->
          return 8 if c.code == 'BTC'
          return 6 if c.code == 'mBTC'
          return 4 if c.code == 'bits'
          return 2
        )(scope.transformCurrency)
        negative: false
      }

      # Modifiers for imposing restrictions on viewValue
      modifiers = {
        max: (input, max) ->
          if input > parseInt(max) then parseInt(max) else input

        decimals: (input, decimals) ->
          places = Math.pow(10, decimals)
          return Math.floor(input * places) / places

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

        return Wallet.convertToSatoshi(modifiedInput, scope.transformCurrency)

      # Model formatter
      scope.formatToView = (modelValue) ->
        return Wallet.convertFromSatoshi(modelValue, scope.transformCurrency)

      ctrl.$parsers.push scope.parseToModel
      ctrl.$formatters.push scope.formatToView

  }
)
