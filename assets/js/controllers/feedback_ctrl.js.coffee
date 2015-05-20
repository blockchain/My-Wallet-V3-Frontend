@FeedbackCtrl = ($scope, $log, $state) ->
 
  $scope.state = $state
  $scope.formSubmitted = false

  $scope.setFormSubmitted = () ->
    $scope.formSubmitted = true