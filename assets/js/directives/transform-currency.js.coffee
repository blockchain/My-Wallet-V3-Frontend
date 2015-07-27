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

      restrict = {}

      # Restriction imposing functions
      restrictions = {
        max: (input, max) ->
          if input > parseInt(max) then parseInt(max) else input

        decimals: (input, decimals) ->
          places = Math.pow(10, decimals)
          formatted = Math.floor(input * places) / places
          if formatted != input then formatted else input

        negative: (input, restrict) ->
          if restrict then Math.abs(input) else input

        maxlength: (input, length) ->
          parseFloat(input.toString().slice(0, parseInt(length)))
      }

      # Load restrictions from view
      for r,m of restrictions
        camelCase = 'restrict' + r.charAt(0).toUpperCase() + r.slice(1)
        restrict[r] = JSON.parse(attrs[camelCase]) if attrs[camelCase]?

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
