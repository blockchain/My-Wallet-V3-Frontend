@SettingsAddressesCtrl = ($scope, Wallet, $translate) ->
  $scope.hdAddresses = [{address: "fake", balance: 1000000, account: Wallet.accounts[0]}]
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.display = {archived: false}

  $scope.archive = (address) ->
    Wallet.archive(address)
    
  $scope.unarchive = (address) ->
    Wallet.unarchive(address)
    
  $scope.delete = (address) ->
    $translate("LOSE_ACCESS").then (translation) ->    
      if confirm translation
        Wallet.deleteLegacyAddress(address)