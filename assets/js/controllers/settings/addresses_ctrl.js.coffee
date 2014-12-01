@SettingsAddressesCtrl = ($scope, Wallet) ->
  $scope.hdAddresses = [{address: "fake", balance: 1000000, account: Wallet.accounts[0]}]
  $scope.legacyAddresses = Wallet.legacyAddresses
