walletApp.directive 'onEnter', ->
  (scope, element, attrs) ->
    element.bind 'keydown keypress', (event) ->
      if event.which == 13
        scope.$apply ->
          scope.$eval attrs.onEnter, 'event': event
          return
        event.preventDefault()
      return
    return