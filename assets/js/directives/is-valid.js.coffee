walletApp.directive('isValid', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      isValid: '='
    }
    link: (scope, elem, attrs, ngModel) ->

      ngModel.$parsers.unshift (viewValue) ->

        if scope.isValid(viewValue)
          ngModel.$setValidity('isValid', true)
          return viewValue
        else
          ngModel.$setValidity('isValid', false)
          return undefined

  }
)