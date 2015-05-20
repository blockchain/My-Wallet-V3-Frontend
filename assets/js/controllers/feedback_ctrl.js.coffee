@FeedbackCtrl = ($scope, Wallet, $log) ->
 
  $scope.formSubmitted = false

  $scope.setFormSubmitted = () ->
    $scope.formSubmitted = true