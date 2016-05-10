angular
  .module('walletApp')
  .directive('passwordEntropy', passwordEntropy);

function passwordEntropy (MyWalletHelpers) {
  const directive = {
    restrict: 'E',
    scope: {
      password: '='
    },
    templateUrl: 'templates/password-entropy.jade',
    controller: passwordEntropyController
  };
  return directive;

  function passwordEntropyController ($scope) {
    let scorePassword;
    MyWalletHelpers.then((helpers) => {
      scorePassword = helpers.scorePassword;

      $scope.$watch('password', (newPw) => {
        let score = scorePassword(newPw);
        $scope.score = score > 100 ? 100 : score;
        $scope.setDisplay($scope.score);
      });
    });

    $scope.score = 0;

    const displayOptions = {
      '0': ['progress-bar-danger', 'weak'],
      '25': ['progress-bar-warning', 'regular'],
      '50': ['progress-bar-info', 'normal'],
      '75': ['progress-bar-success', 'strong']
    };

    $scope.setDisplay = (score) => {
      let threshold = Object.keys(displayOptions).filter(threshold => threshold <= score).reverse()[0];
      [$scope.barColor, $scope.strength] = displayOptions[threshold];
    };
  }
}
