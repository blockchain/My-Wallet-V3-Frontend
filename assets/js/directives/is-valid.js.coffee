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
          ngModel.$setValidity('isNotValid', true)
          return viewValue
        else
          ngModel.$setValidity('isNotValid', false)
          return undefined

  }
)