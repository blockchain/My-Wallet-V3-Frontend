walletApp.directive('helperButton', ($translate) ->
  {
    restrict: "E"
    replace: true
    scope: {
      content: '@'
      url: '@'
      placement: '@'
      title: '@'
    }
    templateUrl: "templates/helper-button.jade"
    link: (scope, elem, attrs) ->

      $translate(scope.content).then (translation) ->
        scope.content = translation

      $translate(scope.title).then (translation) ->
        scope.title = translation

      scope.helperText =
        templateUrl: 'templates/helper-popover.jade'
        placement: scope.placement || 'right'
        title: scope.title || ''

  }
)
