walletApp.directive('singleClickSelect', ($window) ->
  {
    restrict: "A"
    link: (scope, elem, attrs) ->
      scope.highlighted = false

      scope.select = () ->
        text = elem[0]

        range = document.createRange()
        range.setStartBefore(text.firstChild)
        range.setEndAfter(text.lastChild)

        selection = $window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        
        unless $window.getSelection().toString() == ''
          scope.highlighted = true

  }
)

