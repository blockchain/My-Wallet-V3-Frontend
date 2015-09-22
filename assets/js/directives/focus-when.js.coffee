angular.module('walletApp').directive('focusWhen', ($timeout) ->
  {
    restrict: 'A'
    link: (scope, elem, attrs, ctrl) ->
      elem[0].focus() if scope.$eval(attrs.focusWhen)
  }
)
