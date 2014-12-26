@AddressCtrl = ($scope, Wallet, $log, $state, $stateParams, $filter) ->
  $scope.address = {address: null}
  $scope.accounts = Wallet.accounts
  $scope.show = {watchOnly: false, editLabel: false}
  $scope.newLabel = null
  
  $scope.url = null
  
  $scope.$watch "address.address", (newValue) ->
    if newValue?
      $scope.url = 'bitcoin://' + newValue
        
  $scope.signMessage = () ->
    window.confirm("Coming soon")  
    
  $scope.changeLabel = (label) ->
    Wallet.changeLegacyAddressLabel($scope.address, label)
    $scope.show.editLabel = false
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
  
  $scope.$watchCollection "accounts", () ->
    address = $filter("getByProperty")("address", $stateParams.address, Wallet.legacyAddresses)
    if address?
      $scope.address.address = address.address
      # $scope.address.account = address.account
      $scope.address.label = address.label
      $scope.address.isWatchOnlyLegacyAddress = address.isWatchOnlyLegacyAddress
      $scope.newLabel = address.label
    
  # First load:      
  $scope.didLoad()