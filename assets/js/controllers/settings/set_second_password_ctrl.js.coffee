walletApp.controller "SetSecondPasswordCtrl", ($scope, $log, Wallet, $modalInstance, $translate, $timeout) ->

  $scope.isValid = false

  $scope.fields = {password: "", confirmation: ""}

  $scope.busy = null

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.setPassword = () ->
    return if $scope.busy || !$scope.isValid

    $scope.busy = true
    $scope.$root.$safeApply($scope)

    success = () ->
      $scope.busy = false
      $modalInstance.dismiss ""
      $scope.$emit('saveActivityUpdate', 'SETTINGS', 'SET_SECOND_PASSWORD')

    $timeout((->
      Wallet.setSecondPassword($scope.fields.password, success)
    ), 500)

  $scope.$watch "fields.confirmation", (newVal) ->
    if newVal?
      $scope.validate(false)

  $scope.validate = (visual=true) ->
    isValid = true

    $scope.errors = {password: null, confirmation: null}
    $scope.success = {password: false, confirmation: false}

    if $scope.fields.password == ""
      isValid = false
    else
      if $scope.fields.password.length > 3
        $scope.success.password = true
      else
        isValid = false
        if visual
          $translate("TOO_SHORT").then (translation) ->
            $scope.errors.password = translation

    if $scope.fields.confirmation == ""
      isValid = false
    else
      if $scope.fields.confirmation == $scope.fields.password
        $scope.success.confirmation = true
      else
        isValid = false
        if visual
          $translate("NO_MATCH").then (translation) ->
            $scope.errors.confirmation = translation

    $scope.isValid = isValid

  $scope.validate()
