walletApp.directive('watchForInactivity', (Wallet) ->
  {
    restrict: "AC"
    link: () ->
      document.onmousedown = () ->
        if Wallet.store.getGuid()
          Wallet.store.setLogoutTime(Wallet.store.getLogoutTime())
  }
)