walletApp.directive('didYouKnow', (DidYouKnow) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/did-you-know.jade"
    link: (scope, elem, attrs) ->
      scope.getRandInRange = (min, max) ->
        Math.floor(Math.random() * (max - min + 1) + min)

      scope.dyk = DidYouKnow.dyks[scope.getRandInRange(0, DidYouKnow.dyks.length - 1)]

  }
)
