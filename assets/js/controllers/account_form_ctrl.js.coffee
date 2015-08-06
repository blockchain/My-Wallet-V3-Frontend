walletApp.controller "AccountFormCtrl", ($scope, Wallet, $modalInstance, $log, $translate, account, $modal) ->

  $scope.accounts = Wallet.accounts

  $scope.fields =
    name: ''

  $scope.status =
    edit: false
    busy: null

  if account?
    $scope.fields.name = account.label
    $scope.status.edit = true

  $scope.close = () ->
    $modalInstance.dismiss ""

  $scope.createAccount = () ->
    $scope.status.busy = true

    success = () ->
      $scope.status.busy = false
      $modalInstance.dismiss ""
      Wallet.saveActivity(3)

      $translate(['SUCCESS', 'ACCOUNT_CREATED']).then (translations) ->
        $scope.$emit 'showNotification',
          type: 'created-account'
          icon: 'ti-layout-list-post'
          heading: translations.SUCCESS
          msg: translations.ACCOUNT_CREATED

    error = () ->
      $scope.status.busy = false

    cancel = () ->
      $scope.status.busy = false

    Wallet.createAccount($scope.fields.name, success, error, cancel)

  $scope.updateAccount = () ->
    $scope.status.busy = true

    success = () ->
      $scope.status.busy = false
      $modalInstance.dismiss ""
      Wallet.saveActivity(3)

    error = () ->
      $scope.status.busy = false

    Wallet.renameAccount(account, $scope.fields.name, success, error)

  $scope.isNameUnused = (name) ->
    for acct in $scope.accounts()
      return false if acct.label == name
    return true
