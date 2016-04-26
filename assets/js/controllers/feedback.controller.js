angular
  .module('walletApp')
  .controller('FeedbackCtrl', FeedbackCtrl);

function FeedbackCtrl ($scope, $log, $state, $http, Alerts, $translate) {
  $scope.rating = 'MEH';
  $scope.state = $state;
  $scope.formStage = 0;

  $scope.failed = () => Alerts.displayError('FEEDBACK_SUBMIT_FAILED');

  $scope.setFormSubmitted = () => {
    if ($scope.formStage === 0) {
      const form = {
        'rating': $scope.rating,
        'description-good': $scope.descriptionGood,
        'description-bad': $scope.descriptionBad,
        'fullname': $scope.fullname,
        'email': $scope.email
      };
      $http.post('/feedback', form).success(data => {
        if (data.success) {
          $scope.formStage = 2;
        } else {
          $scope.formStage = 0;
          $scope.failed();
        }
      }).error(() => {
        $scope.formStage = 0;
        $scope.failed();
      });
    }
    $scope.formStage = 1;
  };
}
