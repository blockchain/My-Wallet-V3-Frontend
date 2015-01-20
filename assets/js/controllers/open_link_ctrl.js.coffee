@OpenLinkController = ($scope, Wallet, $translate, $stateParams, $state) ->        
  
  paymentRequest = Wallet.parsePaymentRequest($stateParams.uri)  
  
  Wallet.goal.send = paymentRequest
  
  if !Wallet.status.isLoggedIn
    Wallet.displayInfo "Please login to your wallet to proceed.", true
    $state.go("login")