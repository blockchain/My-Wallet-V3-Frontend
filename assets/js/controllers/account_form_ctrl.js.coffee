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

      $translate("SUCCESS").then (titleTranslation) ->
        $translate("ACCOUNT_CREATED").then (messageTranslation) ->

          modalInstance = $modal.open(
            templateUrl: "partials/modal-notification.jade"
            controller: "ModalNotificationCtrl"
            windowClass: "notification-modal"
            resolve:
              notification: ->
                {
                  type: 'created-account'
                  icon: 'ti-layout-list-post'
                  heading: titleTranslation
                  msg: messageTranslation
                }
          ).opened.then () ->
            Wallet.store.resetLogoutTimeout()

    error = () ->
      $scope.accountForm.new.$setValidity('incorrectPassword', false)
      $scope.status.busy = false

    cancel = () ->
      $scope.status.busy = false

    Wallet.createAccount($scope.fields.name, success, error, cancel)

  $scope.updateAccount = () ->
    $scope.status.busy = true

    success = () ->
      $scope.status.busy = false
      $modalInstance.dismiss ""

    error = () ->
      $scope.status.busy = false

    Wallet.renameAccount(account, $scope.fields.name, success, error)

  $scope.isNameUnused = (name) ->
    for acct in $scope.accounts
      return false if acct.label == name
    return true
