walletApp.directive('didYouKnow', () ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/did-you-know.jade"
    scope: {
      dyk: '='
    }
    link: (scope, elem, attrs) ->
  }
)
