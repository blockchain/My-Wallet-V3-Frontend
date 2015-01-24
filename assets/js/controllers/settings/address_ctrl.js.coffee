@AddressCtrl = ($scope, Wallet, $log, $state, $stateParams, $filter, $translate) ->
  $scope.address = {address: null}
  $scope.accounts = Wallet.accounts
  $scope.show = {watchOnly: false, editLabel: false}
  $scope.errors = {label: null}
  $scope.newLabel = null
  $scope.hdAddresses = Wallet.hdAddresses
  
  $scope.url = null
  
  $scope.$watch "address.address", (newValue) ->
    if newValue?
      $scope.url = 'bitcoin://' + newValue
        
  $scope.signMessage = () ->
    window.confirm("Coming soon")  
    
  $scope.changeLabel = (label) ->
    $scope.errors.label = null
    
    success = () ->
      $scope.show.editLabel = false
      
    error = (error) ->
      $translate("INVALID_CHARACTERS_FOR_LABEL").then (translation) ->      
        $scope.errors.label = translation
    
    Wallet.changeAddressLabel($scope.address, label, success, error)
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
  
  $scope.$watchCollection "accounts + hdAddresses", () ->
    # Is it a legacy address?
    address = $filter("getByProperty")("address", $stateParams.address, Wallet.legacyAddresses)
    
    # Or an HD address?
    if !address?
      address = $filter("getByProperty")("address", $stateParams.address, $scope.hdAddresses)
    
    if address?
      $scope.address = address
      $scope.newLabel = address.label
          
  # First load:      
  $scope.didLoad()