angular
  .module('walletApp')
  .controller('BuyEmailCtrl', BuyEmailCtrl);

function BuyEmailCtrl ($scope, Alerts, Wallet, $q) {
  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;

  $scope.changeEmail = (email, successCallback, errorCallback) => {
    $scope.rejectedEmail = void 0;
    Alerts.clear($scope.alerts);

    $q((res, rej) => Wallet.changeEmail(email, res, rej))
      .then(successCallback, errorCallback)
      .finally(() => { $scope.editEmail = false; });
  };

  $scope.$watch('$parent.step', (newVal) => {
    if ($scope.steps['email'] === newVal && !Wallet.goal.firstLogin) Wallet.resendEmailConfirmation();
  });
}
