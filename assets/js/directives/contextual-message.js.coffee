walletApp.directive('contextualMessage', () ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/contextual-message.jade"
    link: (scope, elem, attrs) ->
      scope.putMsgInConsole = ()->
        console.log("justin, should we start drinking now?")
  }
)
