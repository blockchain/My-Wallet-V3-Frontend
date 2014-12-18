@ClaimCtrl = ($scope, Wallet, $translate, $stateParams, $state) ->        
  Wallet.goal = {claim: $stateParams.code}
  
  Wallet.displayInfo "Please login to your wallet to proceed.", true
  
  $state.go("login")