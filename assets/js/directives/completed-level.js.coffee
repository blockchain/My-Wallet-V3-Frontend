walletApp.directive('completedLevel', ($translate) ->
  {
    restrict: "E"
    replace: true
    scope: { 
      content: '@'
      img: '@'
      message: '@'
    }
    templateUrl: 'templates/completed-level.jade'
    link: (scope, elem, attrs) ->

      $translate(scope.content).then (translation) ->
        scope.content = translation

      $translate(scope.message).then (translation) ->
        scope.message = translation

      scope.tooltip =
        templateUrl: 'templates/completed-level-tooltip.jade'

  }
)
