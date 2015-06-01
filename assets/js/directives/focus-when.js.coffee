walletApp.directive('focusWhen', ($timeout) ->
  {
    scope: {
      trigger: '@focusWhen'
    }
    link: (scope, elem) ->
      scope.$watch 'trigger', (value) ->
        if value
          elem[0].focus()
          scope.trigger = false
  }
)