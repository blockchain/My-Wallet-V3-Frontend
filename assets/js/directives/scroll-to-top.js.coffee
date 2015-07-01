walletApp.directive('scrollToTop', ($window) ->
  {
    restrict: "A"
    link: (scope, elem, attrs) ->
      scope.$watch (->
        $window.location.hash
        ), (newVal, oldVal) ->
            if newVal != oldVal 
              elem[0].scrollTop = 0
  }
)
