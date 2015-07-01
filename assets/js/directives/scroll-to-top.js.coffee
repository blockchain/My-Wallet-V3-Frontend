walletApp.directive('scrollToTop', () ->
  {
    restrict: "A"
    link: (scope, elem, attrs) ->
      scope.$watch (->
        elem[0].scrollHeight
        ), (newVal, oldVal) ->
            if newVal != oldVal 
              elem[0].scrollTop = 0
  }
)
