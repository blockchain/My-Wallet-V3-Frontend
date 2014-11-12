@SettingsNavigationCtrl = ($scope, Wallet, filterFilter) ->
  $scope.status    = Wallet.status
  
  $scope.walletHasPaymentRequests = () ->
    Wallet.paymentRequests? &&  filterFilter(Wallet.paymentRequests, {complete:false,canceled:false}).length > 0

    
  