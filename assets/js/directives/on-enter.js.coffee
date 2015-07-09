walletApp.directive('onEnter', () ->
  {
    restrict: 'A'
    link: (scope, elem, attrs) ->

      action = (event) ->
        if event.which == 13
          event.preventDefault()
          scope.$eval(attrs.onEnter, 'event': event)

      elem.bind 'keydown keypress', action

      scope.$on '$destroy', () ->
        elem.unbind 'keydown keypress', action
  }
)
