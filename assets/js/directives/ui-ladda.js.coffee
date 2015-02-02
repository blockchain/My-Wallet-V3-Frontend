walletApp.directive "uiLadda",  ($timeout, $compile, $translate) ->
  # angular-ladda doesn't work nicely with ui-bootstrap
  return {
    restrict: "A"
    replace: false
    template: '<span class="ladda-label" translate="{{ translation }}"></span><span class="ladda-spinner" style="margin:-8px;"><img src="img/ladda-spinner.gif"></img></span>'
    link: (scope, element, attrs) ->
      element.addClass("ladda-button")
      element.attr("ladda", attrs["uiLadda"])

      element.removeAttr("ui-ladda")
      element.removeAttr("ng-click") # Prevent action from being called twice
      
      $compile(element)(scope)
      
      scope.translation = null
            
      $translate(element.attr("ladda-translate")).then (translation) ->
        scope.translation = translation
      
      attrs.$observe "uiLadda", (newVal) ->
        if newVal? 
          if scope.$eval(newVal)
            element.attr("data-loading", true)
            element.attr("disabled", true)
          else
            element.removeAttr("data-loading")
            element.removeAttr("disabled")
            

  }
