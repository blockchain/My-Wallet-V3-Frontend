walletApp.directive 'walletNavToggle', (Wallet, $state) ->
  {
    restrict: 'ACE'
    link: (scope, elem, attr) ->

      if Wallet.status.isLoggedIn
        toggle = document.getElementById("wallet-nav-toggle")
        walletNav = document.querySelector(".left-nav")
        walletLinks = document.querySelectorAll("li.header")

        toggleClass = (el) ->
          if el.classList.contains("toggled")
            el.classList.remove("toggled")
          else
            el.classList.add("toggled")
          console.log('hey, im getting clicked!')

        removeToggledClass = (el) ->
          el.classList.remove("toggled")

        toggle.addEventListener(
          'click',
          () ->
            toggleClass(walletNav)
          false
        )

        i = 0
        while i < walletLinks.length
          walletLinks[i].addEventListener 'click', (->
            removeToggledClass(walletNav)
            return
          ), false
          i++

  }
