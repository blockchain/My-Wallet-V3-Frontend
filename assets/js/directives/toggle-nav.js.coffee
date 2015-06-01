walletApp.directive 'toggleNav', (Wallet) ->
  {
    restrict: 'ACE'
    link: (scope, element, attrs) ->
      listItems = element.parent().children()
      element.on 'click', ->
        listItems.removeClass('current')
        $(this).addClass('current')
  }
