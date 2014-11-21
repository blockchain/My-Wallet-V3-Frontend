@OpenLinkController = ($scope, Wallet, $translate, $stateParams, $state) ->        
  
  paymentRequest = Wallet.parsePaymentRequest($stateParams.uri)  
  
  Wallet.goal = {send: paymentRequest}
  
  Wallet.displayInfo "Please login to your wallet to proceed.", true
  
  $state.go("login")