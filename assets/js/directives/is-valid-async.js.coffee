angular.module('walletApp').directive('isValidAsync', ($q, Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->

      validator = scope.$eval(attrs.isValidAsync)

      return unless typeof validator == 'function'

      ctrl.$asyncValidators.isValidAsync = (modelValue, viewValue) ->
        deferred = $q.defer()

        success = () ->
          deferred.resolve()

        error = () ->
          deferred.reject()

        validator modelValue, success, error

        return deferred.promise

  }
)
