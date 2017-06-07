angular
  .module('walletApp')
  .controller('SfoxVerifyController', SfoxVerifyController);

function SfoxVerifyController (Env, $scope, state, sfox, modals, QA) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  $scope.exchange = $scope.vm.exchange;
  $scope.goTo = (s) => $scope.vm.goTo(s);

  $scope.openHelper = modals.openHelper;

  // $scope.$on('$destroy', () => { exchange.profile && exchange.profile.setSSN(null); });
}
