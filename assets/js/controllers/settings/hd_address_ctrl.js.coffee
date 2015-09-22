angular.module('walletApp').controller "HDAddressCtrl", ($scope, Wallet, $log, $state, $stateParams, $filter, $translate) ->
  $scope.address = {address: null}
  $scope.accounts = Wallet.accounts
  $scope.show = {editLabel: false}
  $scope.errors = {label: null}
  $scope.newLabel = null

  $scope.url = null

  $scope.$watch "address.address", (newValue) ->
    if newValue?
      $scope.url = 'bitcoin://' + newValue

  $scope.signMessage = () ->
    window.confirm("Coming soon")

  $scope.changeLabel = (label, successCallback, errorCallback) ->
    $scope.errors.label = null

    success = () ->
      $scope.show.editLabel = false
      successCallback()

    error = (error) ->
      $translate("INVALID_CHARACTERS_FOR_LABEL").then (translation) ->
        $scope.errors.label = translation
      errorCallback()

    Wallet.changeHDAddressLabel($scope.address.account, $scope.address.index, label, success, error)

  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings

  $scope.$watchCollection "accounts()", () ->
    hdAddresses = Wallet.hdAddresses(true)
    for hdAddress in hdAddresses
      if hdAddress.account.index == parseInt($stateParams.account) && hdAddress.index == parseInt($stateParams.index)
        $scope.address = hdAddress

  # First load:
  $scope.didLoad()
