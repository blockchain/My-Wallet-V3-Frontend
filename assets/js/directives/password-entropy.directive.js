angular
  .module('walletDirectives')
  .directive('passwordEntropy', passwordEntropy);

function passwordEntropy (MyWalletHelpers) {
  const directive = {
    restrict: 'E',
    scope: {
      password: '='
    },
    templateUrl: 'templates/password-entropy.pug',
    controller: passwordEntropyController
  };
  return directive;

  function passwordEntropyController ($scope) {
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

    $scope.$watch('password', (newPw) => {
      let score = MyWalletHelpers.scorePassword(newPw);
      $scope.score = score > 100 ? 100 : score;
      $scope.setDisplay($scope.score);
    });
  }
}
