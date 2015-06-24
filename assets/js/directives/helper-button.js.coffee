walletApp.directive('helperButton', ($translate, $compile, $templateCache) ->
  {
    restrict: "E"
    replace: true
    scope: {
      content: "@"
      url: "@"
    }
    templateUrl: "templates/helper-button.jade"
    link: (scope, elem, attrs) ->
      scope.content = ""; return
      scope.url = ""; return
      # scope.template = $templateCache.get("partials/helper-text-popup.html")
  }
)

