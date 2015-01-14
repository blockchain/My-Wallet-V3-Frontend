@SettingsSecurityCenterCtrl = ($scope, Wallet) ->
  $scope.level = 0
  $scope.actions = [{}, {}]
  
  $scope.doSomething = () ->
    if $scope.level < 2
      $scope.level++
      $scope.actions.splice(0,1)
