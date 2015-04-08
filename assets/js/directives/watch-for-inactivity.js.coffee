walletApp.directive('watchForInactivity', (Wallet) ->
  {
    restrict: "AC"
    link: () ->
      document.onmousedown = () ->
        if Wallet.store.getGuid()
          Wallet.my.setLogoutTime(Wallet.my.getLogoutTime())
  }
)