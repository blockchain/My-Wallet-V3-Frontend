angular
  .module('walletApp')
  .controller('UnocoinVerifyController', UnocoinVerifyController);

function UnocoinVerifyController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA, bcPhoneNumber) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.exchange = $scope.vm.exchange;

  $scope.openHelper = modals.openHelper;

  $scope.goTo = (s) => $scope.vm.goTo(s);

  AngularHelper.installLock.call($scope);
  $scope.$watch('state.step', (val) => console.log(val));
}
