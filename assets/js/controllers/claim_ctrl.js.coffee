@ClaimCtrl = ($scope, Wallet, $translate, $stateParams, $state) ->
  balance = Wallet.fetchBalanceForRedeemCode($stateParams.code)        
  Wallet.goal = {claim: {code: $stateParams.code, balance: balance}}
  
  Wallet.displayInfo "Please login to your wallet to proceed.", true
  
  $state.go("login")