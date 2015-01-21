@SettingsSecurityCenterCtrl = ($scope, Wallet, SecurityCenter, filterFilter, $modal) ->
  $scope.security = SecurityCenter.security
  
  $scope.settings = Wallet.settings
  $scope.user = Wallet.user
  $scope.status = Wallet.status
    
  $scope.legacyAddresses = []
  $scope.unfilteredLegacyAddresses = Wallet.legacyAddresses

  $scope.greaterThan = (prop, val) ->
    (item) ->
      if item[prop] > val
        true

  $scope.$watchCollection "status.legacyAddressBalancesLoaded", ->
    if $scope.legacyAddresses.length == 0 && $scope.status.legacyAddressBalancesLoaded == true
      for address in filterFilter(filterFilter($scope.unfilteredLegacyAddresses, {active: true, isWatchOnlyLegacyAddress: false}), $scope.greaterThan('balance', 50000))
        $scope.legacyAddresses.push address

  $scope.transactions = Wallet.transactions
          
  $scope.transfer = (address) ->
    $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
    )