walletApp.directive('didYouKnow', () ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/did-you-know.jade"
    link: (scope, elem, attrs) ->
      console.log('directive should be wired up')
  }
)

